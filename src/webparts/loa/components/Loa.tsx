import * as React from 'react';
import styles from './Loa.module.scss';
import { ILoaProps } from './ILoaProps';
import {readAllLists, arrayUnique} from  '../Services/DataRequests';
import IListItems from './IListItems/IListItems';
import IFilterFields from './IFilterFields/IFilterFields';
import { Icon, initializeIcons } from '@fluentui/react';

export default function LOA (props: ILoaProps){

  initializeIcons();

  const [listItems, setListItems] = React.useState([]);
  // const [schools, setSchools] = React.useState([]);
  const [formTitles, setFormTitles] = React.useState([]);
  // const [formLocationNos, setFormLocationNos] = React.useState([]);
  const [preloaderVisible, setPreloaderVisible] = React.useState(true);
  const [filterFields, setFilterFields] = React.useState({
    title: {key: "", text: ""},
    hrStatus: {key: "", text: ""},
    empNumber: "",
    fullName: "",
    locName:"",
    posGroup:""
  });

  const queryParams = new URLSearchParams(window.location.search);

  React.useEffect(()=>{
    //getSchools(props.context, 'https://pdsb1.sharepoint.com/sites/contentTypeHub', 'schools', 400).then(r=>setSchools(r));
    // getMyLocsDpd(props.context, props.testingEmail).then(r=>{
    //   setFormLocationNos(r.sort((a:any, b:any) => a.text.localeCompare(b.text)));
    // });
    readAllLists(props.context, props.listUrl, props.listName, props.pageSize).then((r: any) =>{
      console.log("all results", r);
      const listItemsForms  : any = r.flat().map((item:any) => ({key: item.title, text: item.title}));
      console.log("listItemsForms", listItemsForms);
      setFormTitles(arrayUnique(listItemsForms, 'key').sort((a:any, b:any) => a.key.localeCompare(b.key)));
      setListItems(r.flat());
      setPreloaderVisible(false);
    });

    const formTitleParam = queryParams.get("formTitle");
    if (queryParams.has("formTitle")){
      setFilterFields(prevState =>({
        ...prevState,
        ["title"] : {key: formTitleParam, text: formTitleParam}
      }));
    }

    if (props.refreshEvery5min) setInterval(refreshHandler, 300000);

  }, []);

  const onChangeFilterField = (fieldNameParam: string) =>{
    return(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: any) =>{   
      setFilterFields({
        ...filterFields,
        [fieldNameParam] : text || ""
      });

      if(fieldNameParam === "title"){
        if(text == undefined) window.history.replaceState({}, '', `${location.pathname}`);
        else{
          if (queryParams.has('formTitle')) queryParams.delete('formTitle');
          window.history.replaceState({}, '', `${location.pathname}?formTitle=${text.text}`);
        }
      }

    };
  };
  
  const resetSrch = () =>{    
    setFilterFields({
      title: {key: "", text: ""},
      hrStatus: {key: "", text: ""},
      empNumber: "",
      fullName: "",
      locName: "",
      posGroup: ""
    });
    if (queryParams.has('formTitle')) queryParams.delete('formTitle');
    window.history.replaceState({}, '', `${location.pathname}`);
  };

  const refreshHandler = () => {
    setPreloaderVisible(true);
    readAllLists(props.context, props.listUrl, props.listName, props.pageSize).then((r: any) =>{
      const listItemsForms  : any = r.flat().map((item:any) => ({key: item.title, text: item.title}));
      setFormTitles(arrayUnique(listItemsForms, 'key').sort((a:any, b:any) => a.key.localeCompare(b.key)));
      setListItems(r.flat());
      setPreloaderVisible(false);
    });
  };


  return (
    <div className={ styles.LOA }>
      <h2>{props.wpTitle}</h2>
  
      <IFilterFields 
        filterField={filterFields} 
        onChangeFilterField={onChangeFilterField} 
        resetSrch={resetSrch}
        formTitlesOptions={formTitles}
        // formLocationNosOptions={formLocationNos}
      />

      {props.showRefresh && 
        <a className={styles.refreshBtn} onClick={refreshHandler} href="javascript: void(0)"><Icon iconName='Refresh' />{props.refreshText}</a>
      }

      <IListItems
        items = {listItems}
        preloaderVisible = {preloaderVisible}
        filterField = {filterFields}
        // schools = {schools}
        showEdit={props.showEdit}
        context={props.context}
      />
    </div>
  );
}
