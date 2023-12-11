import { WebPartContext } from "@microsoft/sp-webpart-base";
import {SPHttpClient} from "@microsoft/sp-http";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/items/get-all";

const getImgStatus = (formStatus: string) =>{
  let imgStatusName: string, imgStatusText: string;
  formStatus.indexOf('_') !== -1 ? formStatus.replace(/ /g,'') : formStatus;
  switch (formStatus){
    case 'Completed':
      imgStatusName = 'completed.svg';
      imgStatusText = 'Completed';
      break;
    case 'New':
    case 'Not Started':
      imgStatusName = 'new.svg';
      imgStatusText = 'Not Started';
      break;
    /*  
    case 'Department_Accepted':
      imgStatusName = 'deptAccepted.svg';
      imgStatusText = 'Accepted by the Department';
      break;
    case 'Department_Rejected':
      imgStatusName = 'deptRejected.svg';
      imgStatusText = 'Rejected by the Department';
      break;
    case 'Approver1_Accepted':
      imgStatusName = 'personAccepted.svg';
      imgStatusText = 'Accepted by Approver';
      break;
    case 'Approver1_Rejected':
      imgStatusName = 'personRejected.svg';
      imgStatusText = 'Rejected by Approver';
      break;
    case 'Submitted':
    case 'Approver1_Inprogress':
    case 'Superintendent_Inprogress':
    case 'Department_Inprogress':
      imgStatusName = 'submitted.svg';
      imgStatusText = 'In Progress for Approval';
      break;
    case 'Superintendent_Accepted':
      imgStatusName = 'superAccepted.svg';
      imgStatusText = 'Accepted by Superintendent';
      break;
    case 'Superintendent_Rejected':
      imgStatusName = 'superRejected.svg';
      imgStatusText = 'Rejected by Superintendent';
      break;
    case 'Approver1_Invalid':
    case 'Superintendent_Invalid':
    case 'Department_Invalid':
      imgStatusName = 'invalid.svg';
      imgStatusText = 'Invalid';
      break;
    */

    //LOA-
    case 'HRSpecialist_inprogress':
      imgStatusName = 'submitted.svg';
      imgStatusText = 'Pending HR Specialist';
      break;
    case 'HRSpecialist_rejected':
      imgStatusName = 'personRejected.svg';
      imgStatusText = 'Rejected by HR Specialist';
      break;
    case 'HRPartner_inprogress':
      imgStatusName = 'submitted.svg';
      imgStatusText = 'Pending HR Partner';
      break;
    case 'HRPartner_rejected':
      imgStatusName = 'personRejected.svg';
      imgStatusText = 'Rejected by HR Partner';
      break;
    case 'HRManager_inprogress':
      imgStatusName = 'submitted.svg';
      imgStatusText = 'Pending HR Manager';
      break;
    case 'HRManager_rejected':
      imgStatusName = 'personRejected.svg';
      imgStatusText = 'Rejected by HR Manager';
      break;
    case 'HRExecutive_inprogress':
      imgStatusName = 'submitted.svg';
      imgStatusText = 'Pending HR Executive';
      break;
    case 'HRExecutive_rejected':
      imgStatusName = 'personRejected.svg';
      imgStatusText = 'Rejected by HR Executive';
      break;
    //-LOA

    default:
      imgStatusName = 'other.svg';
      imgStatusText = 'Other';
      break;
  }
  return [imgStatusName, imgStatusText];
};

const getMyLocationsInfo = async (context: WebPartContext, locNum: string) =>{
  const   restUrl = `/sites/contentTypeHub/_api/web/Lists/GetByTitle('schools')/items?$select=Title,School_x0020_My_x0020_School_x00,School_x0020_Name&$filter=Title eq '${locNum}'`,
          _data = await context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1);
  let locInfo = {};
  
  if(_data.ok){
      const result = await _data.json();
      locInfo = {key: result.value[0].Title, text: `${result.value[0].School_x0020_Name} (${result.value[0].Title})` };
  }
  return locInfo;
};
const getMyLocations = async (context: WebPartContext, testingEmail: string) =>{
  const currUserEmail = testingEmail;
  const restUrl = `/sites/contentTypeHub/_api/web/Lists/GetByTitle('Employees')/items?$filter=MMHubBoardEmail eq '${currUserEmail}'&$select=MMHubLocationNos`;

  let myLocsNum : [] = [];
  const myLocs = await context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then(response => response.json());
  myLocsNum = myLocs.value[0].MMHubLocationNos.split(";");

  return myLocsNum.filter(loc => loc !== '0089');
  //return myLocsNum;
};

export const getMyLocsDpd = async (context: WebPartContext, testingEmail: string) =>{
  const currUserEmail = testingEmail ? testingEmail : context.pageContext.user.email;
  const myLocsNos = await getMyLocations(context, currUserEmail).then(r=>r);
  const myLocsDpd = [];
  
  for(const myLocNo of myLocsNos){
    const myLocDpd = await getMyLocationsInfo(context, myLocNo);//.then(r=>r);
    myLocsDpd.push(myLocDpd);
  }

  return Promise.all(myLocsDpd);
};

const getListItems = async (context: WebPartContext, listItem: any, pageSize: number) =>{
  
  // const sp = spfi(listItem.listUrl).using(SPFx(context));  
  // const listView = await sp.web.lists.getByTitle(listItem.listName).views.getByTitle(listItem.filterFields).select("ViewQuery")();
  // const xml = `<View><Query>${listView.ViewQuery}</Query></View>`;
  // const items = await sp.web.lists.getByTitle(listItem.listName).getItemsByCAMLQuery({ViewXml : xml}, 'FieldValuesAsText');
  // console.log("view query items before formate", items);

  //view=Waiting   FormStatus=HRSpecialist _inprogress

  const listData: any = [];
  const sp = spfi(listItem.listUrl).using(SPFx(context));  
  try{
    const listView = await sp.web.lists.getByTitle(listItem.listName).views.getByTitle(listItem.filterFields).select("ViewQuery")();
    const xml = `<View><Query>${listView.ViewQuery}</Query></View>`;
    if (listView){
      const items = await sp.web.lists.getByTitle(listItem.listName).getItemsByCAMLQuery({ViewXml : xml}, 'FieldValuesAsText');
      if(items){
        console.log("view query items before formate", items);
        items.map((item: any)=>{
          const hrStatus = item.HRStatus.indexOf('_') !== -1 ? item.HRStatus.replace(/ /g, '') : item.HRStatus
          listData.push({
            id: item.Id,
            title: item.Title,
            hrStatus: hrStatus,
            absenceStartHR: item.AbsenceStartHR,
            absenceEndHR: item.AbsenceEndHR,
            history: item.History,
            
            email: item.FieldValuesAsText? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_BoardEmail : null,
            empNumber: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_EmployeeNumber : null,
            fullName: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_FullName : null,
            locationNo: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_LocationNo : null,
            locName: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_Location1 : null,
            posGroup: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_POSGroup : null,
            absenceStart: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_AbsenceStart : null,
            absenceEnd: item.FieldValuesAsText ? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_AbsenceEnd : null,
            parentId: item.FieldValuesAsText? item.FieldValuesAsText.ParentInfo_x005f_x003a_x005f_ID : null,

            contentTypeId: item.ContentTypeId,
            guid: item.GUID,
            created: item.Created,

            formImgStatus: getImgStatus(hrStatus)[0],
            formTextStatus: getImgStatus(hrStatus)[1],
            
            listUrl: listItem.listUrl,
            listName: listItem.listName,
            listDisplayName: listItem.listDisplayName,
          });
        });
      }
    }
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List Items: " + listItem.listName);
  }


  // const listData: any = [];
  // const responseUrl = `${listItem.listUrl}/_api/web/Lists/GetByTitle('${listItem.listName}')/items?$top=${pageSize}&$expand=ParentInfo&$select=Created,Id,GUID,ContentTypeId,Title,History,AbsenceStartHR,AbsenceEndHR,HRStatus,ParentInfo/BoardEmail,ParentInfo/FullName1,ParentInfo/LocationNo,ParentInfo/POSGroup,ParentInfo/EmployeeNumber,ParentInfo/AbsenceStart,ParentInfo/AbsenceEnd,ParentInfo/ID`;
  // try{
  //   const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1); //.then(r => r.json());
  //   if (response.ok){
  //     const results = await response.json();
  //     if(results){
  //       console.log("Raw Response Results---", results);
  //       console.log(`${responseUrl} - Results: ${results.value.length}`);
  //       results.value.map((item: any)=>{
  //         const hrStatus = item.HRStatus.indexOf('_') !== -1 ? item.HRStatus.replace(/ /g, '') : item.HRStatus
  //         listData.push({
  //           id: item.Id,
  //           title: item.Title,
  //           hrStatus: hrStatus,
  //           absenceStartHR: item.AbsenceStartHR,
  //           absenceEndHR: item.AbsenceEndHR,
  //           history: item.History,
            
  //           email: item.ParentInfo? item.ParentInfo.BoardEmail : null,
  //           empNumber: item.ParentInfo ? item.ParentInfo.EmployeeNumber : null,
  //           fullName: item.ParentInfo ? item.ParentInfo.FullName1 : null,
  //           locationNo: item.ParentInfo ? item.ParentInfo.LocationNo : null,
  //           posGroup: item.ParentInfo ? item.ParentInfo.POSGroup : null,
  //           absenceStart: item.ParentInfo ? item.ParentInfo.AbsenceStart : null,
  //           absenceEnd: item.ParentInfo ? item.ParentInfo.AbsenceEnd : null,
  //           parentId: item.ParentInfo? item.ParentInfo.ID : null,

  //           contentTypeId: item.ContentTypeId,
  //           guid: item.GUID,
  //           created: item.Created,

  //           formImgStatus: getImgStatus(hrStatus)[0],
  //           formTextStatus: getImgStatus(hrStatus)[1],
            
  //           listUrl: listItem.listUrl,
  //           listName: listItem.listName,
  //           listDisplayName: listItem.listDisplayName,
  //         });
  //       });
  //     }
  //   }
  // }catch(error){
  //   console.log("MyLocation SPFx Error - Reading List Items: " + listItem.listName);
  // }

  return listData;
};

export const readAllLists = async (context: WebPartContext, listUrl: string, listName: string, pageSize: number) =>{
  const listData: any = [];
  let aggregatedListsPromises : any = [];
  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());
    response.value.map((item: any)=>{
      listData.push({
        listName: item.Title,
        listDisplayName: item.ListDisplayName,
        listUrl: item.ListUrl,
        filterDate: item.FilterDate,
        filterFields: item.FilterFieldName,
      });
    });
  }catch(error){
    console.log("MyLocation SPFx Error - Reading List(s): " + listName);
  }

  listData.map((listItem: any)=>{
    aggregatedListsPromises = aggregatedListsPromises.concat(getListItems(context, listItem, pageSize));
  });

  return Promise.all(aggregatedListsPromises);
};

export const isObjectEmpty = (items: any): boolean=>{
  let isEmpty:boolean = true;
  for (const item in items){
    isEmpty = items[item] === "" && isEmpty ;
  }
  return isEmpty;
};

export const uniq = (arr: any) => {
  const prims:any = {"boolean":{}, "number":{}, "string":{}}, objs:any = [];

  return arr.filter(function(item:any) {
      const type = typeof item;
      if(type in prims)
          // eslint-disable-next-line no-prototype-builtins
          return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
      else
          return objs.indexOf(item) >= 0 ? false : objs.push(item);
  });
};

export const arrayUnique = (arr:any, uniqueKey:any) => {
  const flagList:any = [];
  return arr.filter(function(item:any) {
    if (flagList.indexOf(item[uniqueKey]) === -1) {
      flagList.push(item[uniqueKey]);
      return true;
    }
  });
};



export const getSchools = async (context: WebPartContext, listUrl: string, listName: string, pageSize: number) =>{

  const responseUrl = `${listUrl}/_api/web/Lists/GetByTitle('${listName}')/items?$top=${pageSize}`;
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1).then(r => r.json());

  console.log("school results", response.results);

  return response.value.map((item: any)=>({
    id: item.Id,
    schoolName: item.School_x0020_Name,
    locationCode: item.School_x0020_Location_x0020_Code || "",
    phone: item.School_x0020_Phone || "",
    fax: item.School_x0020_Fax || "",
    address: item.School_x0020_Address + ', ' + item.School_x0020_Municipality + ', ' + item.School_x0020_Postal_x0020_Code,
    stAddress: item.School_x0020_Address,
    cityCode: item.School_x0020_Municipality + ', ' + item.School_x0020_Postal_x0020_Code,
    family: item.School_x0020_Family || "",
    fieldOffice: item.School_x0020_FO || "",
    twitter: item.Twitter,
    website: item.School_x0020_Website_x0020_URL,
    email: item.SchoolEmail,
    image: item.img,
    area: item.Area,    
  }));

};