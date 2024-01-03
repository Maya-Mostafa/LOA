import * as React from 'react';
import {IFilterFieldsProps} from './IFilterFieldsProps';
import {Stack, IStackProps, IStackStyles, SearchBox, ActionButton, initializeIcons, ComboBox, IComboBoxOption, Icon} from '@fluentui/react';
import styles from '../Loa.module.scss';
import {isObjectEmpty} from '../../Services/DataRequests';

export default function IFilterFields (props: IFilterFieldsProps) {
    
    initializeIcons();
    const stackTokens = { childrenGap: 50 };
    const stackStyles: Partial<IStackStyles> = { root: { width: '100%' } };
    const columnProps: Partial<IStackProps> = {
        tokens: { childrenGap: 15 },
        styles: { root: { width: '50%' } },
    };

    const options: IComboBoxOption[] = [
        { key: 'Not Started', text: 'Not Started' },
        { key: 'Completed', text: 'Completed' },
        { key: 'HRSpecialist_inprogress', text: 'Pending HR Specialist' },
        { key: 'HRSpecialist_rejected', text: 'Rejected by HR Specialist' },
        { key: 'HRPartner_inprogress', text: 'Pending HR Partner' },
        { key: 'HRPartner_rejected', text: 'Rejected by HR Partner' },
        { key: 'HRPartner_approved', text: 'Approved by HR Partner' },
        { key: 'HRManager_inprogress', text: 'Pending HR Manager' },
        { key: 'HRManager_rejected', text: 'Rejected by HR Manager' },
        { key: 'HRExecutive_inprogress', text: 'Pending HR Executive' },
        { key: 'HRExecutive_rejected', text: 'Rejected by HR Executive' },
        { key: 'HRExecutive_approved', text: 'Approved by HR Executive' },
        { key: 'Other', text: 'Other' },
    ];


    const onRenderOption = (item: IComboBoxOption) => {
        switch (item.key) {
            case 'Not Started':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/new.svg`)} /><span>{item.text}</span></div>;
            case 'Completed':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/completed.svg`)} /><span>{item.text}</span></div>;
            case 'HRSpecialist_inprogress':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/submitted.svg`)} /><span>{item.text}</span></div>;
            case 'HRSpecialist_rejected':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/personRejected.svg`)} /><span>{item.text}</span></div>;
            case 'HRPartner_inprogress':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/submitted.svg`)} /><span>{item.text}</span></div>;
            case 'HRPartner_rejected':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/personRejected.svg`)} /><span>{item.text}</span></div>;
            case 'HRPartner_approved':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/personAccepted.svg`)} /><span>{item.text}</span></div>;
            case 'HRManager_inprogress':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/submitted.svg`)} /><span>{item.text}</span></div>;
            case 'HRManager_rejected':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/personRejected.svg`)} /><span>{item.text}</span></div>;
            case 'HRExecutive_inprogress':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/submitted.svg`)} /><span>{item.text}</span></div>;
            case 'HRExecutive_rejected':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/personRejected.svg`)} /><span>{item.text}</span></div>;
            case 'HRExecutive_approved':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/personAccepted.svg`)} /><span>{item.text}</span></div>;
            case 'Other':
                return <div className={styles.formStatusCol}><img width="20" src={require(`../../formIcons/other.svg`)} /><span>{item.text}</span></div>;
        }
    };

    
    return(
        <div className={styles.filterForm}>            
            <ActionButton 
                className={styles.resetSrchBtn}
                text="Reset" 
                onClick={props.resetSrch} 
                iconProps={{ iconName: 'ClearFilter' }}
                allowDisabledFocus 
                disabled = {isObjectEmpty(props.filterField)}
            />
            <div>
                <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                    <Stack {...columnProps}>                        
                        {/* <SearchBox 
                            placeholder="Form Title" 
                            underlined
                            value={props.filterField.title}
                            onChange={props.onChangeFilterField("title")}
                            iconProps={{ iconName: 'Rename' }}
                        /> */}
                        <div className={styles.comboCntnr}>
                            <Icon className={styles.comboIcon} iconName="Rename" />
                            <ComboBox
                                className={styles.comboStyle}
                                placeholder="Form Title"
                                options={props.formTitlesOptions} 
                                onChange={props.onChangeFilterField("title")}
                                selectedKey={props.filterField.title.key}                            
                            />
                        </div>
                        {/* <div className={styles.comboCntnr}>
                            <Icon className={styles.comboIcon} iconName="Location" />
                            <ComboBox
                                className={styles.comboStyle}
                                placeholder="All locations for me"
                                options={props.formLocationNosOptions} 
                                onChange={props.onChangeFilterField("locationNo")}
                                selectedKey={props.filterField.locationNo.key}                            
                            />
                        </div> */}
                        <div className={styles.comboCntnr}>
                            <Icon className={styles.comboIcon} iconName="StackedLineChart" />
                            <ComboBox
                                className={styles.comboStyle}
                                placeholder="Status"
                                options={options} 
                                onRenderOption={onRenderOption}
                                onChange={props.onChangeFilterField("hrStatus")}
                                selectedKey={props.filterField.hrStatus.key}                            
                            />
                        </div>
                        <SearchBox 
                            placeholder="Location" 
                            value={props.filterField.locName}
                            onChange={props.onChangeFilterField("locName")}
                            iconProps={{ iconName: 'CityNext' }}
                            showIcon={true}
                            underlined
                            className={styles.srchBox}
                        />
                    </Stack>
                    <Stack {...columnProps}>
                        {/* <SearchBox 
                            placeholder="Status"
                            underlined 
                            value={props.filterField.formStatus.text} 
                            onChange={props.onChangeFilterField("formStatus")}
                            iconProps={{iconName: 'StackedLineChart'}}
                        /> */}
                        <SearchBox 
                            placeholder="Employee Name" 
                            value={props.filterField.fullName}
                            onChange={props.onChangeFilterField("fullName")}
                            iconProps={{ iconName: 'Contact' }}
                            showIcon={true}
                            underlined
                            className={styles.srchBox}
                        />
                        <SearchBox 
                            placeholder="Employee Number" 
                            value={props.filterField.empNumber}
                            onChange={props.onChangeFilterField("empNumber")}
                            iconProps={{ iconName: 'NumberSequence' }}
                            showIcon={true}
                            underlined
                            className={styles.srchBox}
                        />
                        <SearchBox 
                            placeholder="Employee Group" 
                            value={props.filterField.posGroup}
                            onChange={props.onChangeFilterField("posGroup")}
                            iconProps={{ iconName: 'Group' }}
                            showIcon={true}
                            underlined
                            className={styles.srchBox}
                        />
                    </Stack>
                </Stack>
            </div>
        </div>
    );
}