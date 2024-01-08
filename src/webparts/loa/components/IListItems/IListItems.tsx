import * as React from 'react';
import {IListItemsProps} from './IListItemsProps';
import styles from '../Loa.module.scss';
import {MessageBar, MessageBarType, Spinner, Icon, initializeIcons, DialogType, DetailsRow, IDetailsRowStyles, Persona} from '@fluentui/react';
import { ListView, IViewField } from "@pnp/spfx-controls-react/lib/ListView";
import { IFrameDialog  } from "@pnp/spfx-controls-react/lib/IFrameDialog";
import '../LOA.scss';
import { getTheme } from '@fluentui/react/lib/Styling';
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { getEmpPicture } from '../../Services/DataRequests';

const MyRow = (props:any) => {
    const [expand, setExpand] = React.useState(false);

    return(
        <>
            <div className={styles.colExpCntnr}>
                <Icon title='History' className={styles.btnIcon} iconName={expand ? 'CollapseAll' : 'ExpandAll'} onClick={()=>setExpand(prev => !prev)}/>
            </div>
            {expand &&
                <table className={styles.historyTable}>
                    <tr>
                        <th>Date</th>
                        <th>HR</th>
                        <th>Comments</th>
                        <th>Outcome</th>
                        <th>Next Step</th>
                    </tr>
                    {JSON.parse(props.item.history).sort((a:any,b:any) => new Date(a.Date).valueOf() - new Date(b.Date).valueOf()).map((field: any) => {
                        return(
                            <tr key={field.Date}>
                                <td>{new Date(field.Date).toLocaleString()}</td>
                                <td>{field.HR}</td>
                                <td><div dangerouslySetInnerHTML={{__html: field.Comments}}/></td>
                                <td>{field.Outcome}</td>
                                <td>{field.NextStep}</td>
                            </tr>
                        );
                    })}
                </table>
            }
        </>
    );
};

export default function IListItems (props: IListItemsProps) {
    
    const theme = getTheme();
    initializeIcons();

    const [visIFrame, setVisIFrame] = React.useState(false);
    const [formItem, setFormItem] = React.useState(null);
    
    const editFormHandler = (item: any) =>{
        setFormItem(item);
        setVisIFrame(true);
    };

    const initViewFields:IViewField [] = [        
        {
            name: 'hrStatus',
            displayName : 'Status',
            minWidth: 150,
            maxWidth: 200,
            isResizable: true,
            sorting: true,
            render : (item: any) => (
                <div className={styles.formStatusCol}>
                    <img width="25" src={require(`../../formIcons/${item.formImgStatus}`)} />
                    <span>{item.formTextStatus}</span>
                </div>
            )
        },
        {
            name: 'title',
            displayName : 'Form Title',
            minWidth: 150,
            maxWidth: 200,
            sorting: true,
            isResizable: true,
            render : (item: any) => (
            <div>
                {item.parentId ? 
                    <a className={styles.defautlLink} rel="noreferrer" target="_blank" data-interception="off" href={`${item.listUrl}/Lists/Requests/DispForm.aspx?ID=${item.parentId}`}>{item.title}</a>
                    :
                    <span>{item.title}</span>   
                }
            </div>
            )
        },
        {
            name: 'itemID',
            displayName : 'Item ID',
            minWidth: 100,
            maxWidth: 120,
            sorting: true,
            isResizable: true,
        },
        {
            name: 'formDetails',
            displayName : 'Form Details',
            minWidth: 150,
            maxWidth: 200,
            sorting: true,
            isResizable: true,
        },
        {
            name: 'Employee',
            displayName: '',
            sorting: true,
            minWidth: 100,
            isResizable: true,
            maxWidth: 200,
            render : (item: any) => (
                <div>
                    <LivePersona upn={item.email}
                        serviceScope={props.context.serviceScope as any}
                        template={
                          <>
                            <Persona 
                                text={item.fullName} 
                                secondaryText={item.email} 
                                coinSize={48} 
                                imageUrl={getEmpPicture(item.email)}
                            />
                            <div className={styles.empDetails}>
                                <div>{item.locName}</div>
                                <div>{item.posGroup && item.posGroup}</div>
                                <div>{item.empNumber && item.empNumber.toUpperCase()}</div>
                            </div>
                          </>
                        }
                      />
                    
                </div>
            )
        }
    ];

    const viewFields:IViewField [] = [
        ...props.showEdit ? [{
            name: 'edit',
            displayName : 'Edit',
            minWidth: 50,
            maxWidth: 50,
            sorting: true,
            render : (item: any) => (
                <a href="javascript:void(0)"><Icon className={styles.btnIcon} iconName={'Edit'} onClick={()=>editFormHandler(item)} /> </a>
            )
        }] : [],
        ...initViewFields,
    ];

  const filteredItems = (props.items.filter((listItem: any)=>{
    let filterFieldVal: string;
    for (const i in props.filterField) {
        filterFieldVal = typeof(props.filterField[i]) === 'object' ? props.filterField[i].key : props.filterField[i];
        if (listItem[i] === undefined || listItem[i] === null || listItem[i].toString().toLowerCase().indexOf(filterFieldVal.toLowerCase()) === -1)
            return false;
    }
    return true;
  }));

  const onRenderRowHandler = (props: any) => {
    // console.log("onRenderRowProps", props);
    const customStyles: Partial<IDetailsRowStyles> = {};
    if (props.itemIndex % 2 === 0) customStyles.root = { backgroundColor: theme.palette.themeLighterAlt };

    return (
        <div>
            <DetailsRow {...props} styles={customStyles} />
            {props.item.history &&
                <MyRow {...props} />
            }
        </div>
    );
       
  };

  const dialogDismissHandler = () => {
    setVisIFrame(false);
    props.refreshView();
  };

  return(
    <div>
        
        {filteredItems.length === 0 && !props.preloaderVisible &&
            <MessageBar
                messageBarType={MessageBarType.warning}
                isMultiline={false}>
                Sorry, there is no data to display.
            </MessageBar>
        } 
        {props.preloaderVisible &&
            <div>
                <Spinner label="Loading data, please wait..." ariaLive="assertive" labelPosition="right" />
            </div>
        }

        <ListView
            className={styles.loaGrid}
            items={filteredItems}
            viewFields={viewFields}
            // groupByFields={groupByFields}
            stickyHeader={true} 
            onRenderRow={onRenderRowHandler}
        />

        <IFrameDialog 
            url={formItem ? `${formItem.listUrl}/SitePages/PlumsailForms/${formItem.listName}/Item/EditForm.aspx?item=${formItem.id}`: ''}
            width={'80%'}
            height={'80%'}
            hidden={!visIFrame}
            onDismiss={dialogDismissHandler }
            allowFullScreen = {true}
            dialogContentProps={{
                type: DialogType.close,
                showCloseButton: true
            }}
        />

    </div>
  );
}





