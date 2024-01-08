import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IListItemsProps{
    items: any;
    filterField: any;
    preloaderVisible: boolean;    
    // schools: any;
    showEdit: boolean;
    context: WebPartContext;
    refreshView: any;
}