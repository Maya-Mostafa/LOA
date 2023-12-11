import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'LoaWebPartStrings';
import Loa from './components/Loa';
import { ILoaProps } from './components/ILoaProps';

import { Providers, SharePointProvider } from '@microsoft/mgt-spfx';

export interface ILoaWebPartProps {
  description: string;
  wpTitle: string;
  listUrl: string;
  listName: string;
  pageSize: number;
  testingEmail: string;
  showEdit: boolean;
}

export default class LoaWebPart extends BaseClientSideWebPart<ILoaWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<ILoaProps> = React.createElement(
      Loa,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,

        context: this.context,
        wpTitle: this.properties.wpTitle,
        listUrl: this.properties.listUrl,
        listName: this.properties.listName,
        pageSize: this.properties.pageSize,
        testingEmail: this.properties.testingEmail,
        showEdit: this.properties.showEdit
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {

    if (!Providers.globalProvider) {
      Providers.globalProvider = new SharePointProvider(this.context);
    }
    
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              throw new Error('Unknown host');
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('wpTitle', {
                  label: 'Webpart Title',
                  value: this.properties.wpTitle
                }),
                PropertyPaneTextField('listUrl', {
                  label: 'List URL',
                  value: this.properties.listUrl
                }),
                PropertyPaneTextField('listName', {
                  label: 'List Name',
                  value: this.properties.listName
                }),
                PropertyPaneTextField('pageSize', {
                  label: 'Number of Items',
                  value: this.properties.pageSize.toString()
                }),
                PropertyPaneCheckbox('showEdit', {
                  text: 'Show Edit Option',
                  checked: this.properties.showEdit
                }),
              ]
            },
            
          ]
        }
      ]
    };
  }
}

