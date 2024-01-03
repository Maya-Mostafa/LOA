import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ILoaProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;

  wpTitle: string;
  context: WebPartContext;
  listUrl: string;
  listName: string;
  pageSize: number;
  testingEmail: string;
  showEdit: boolean;

  showRefresh: boolean;
  refreshText: string;
  refreshEvery5min: boolean;

}
