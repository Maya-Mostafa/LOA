export interface IFilterFieldsProps{
    onChangeFilterField: any;
    filterField: {
        title: {key: string, text: string},
        hrStatus: {key: string, text: string},
        empNumber: string,
        fullName: string,
        locName: string,
        posGroup: string,
    };
    resetSrch: any;    
    formTitlesOptions: any;
    formLocationNosOptions: any;
}