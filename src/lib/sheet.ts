import { CellValue } from "../domain/@types";

export const getLastDataRow = (
  Sheet: GoogleAppsScript.Spreadsheet.Sheet,
  Column = "A"
) => {
  // Colonne sur laquelle compter les lignes
  const lastRow = Sheet.getLastRow();
  const range = Sheet.getRange(`${Column}${lastRow}`);
  if (range.getValue()[0][0] !== "") return lastRow;

  return range.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
};

/**
 * Convertit un indice de colonne format R1C1 en indice format A1
 */
export const columnToLetter = (column: number) => {
  let temp,
    letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
};

export const getTab = (tabName: string) => {
  const activeSheet = SpreadsheetApp.getActiveSpreadsheet();

  const tab = activeSheet.getSheetByName(tabName);
  if (tab === null) throw new Error("tab === null");

  return tab;
};

type GetTabValues = (props: {
  sheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  tabName: string;
}) => (string | number)[][];

export const getTabValues: GetTabValues = ({ sheet, tabName }) => {
  const tabEmpty = [[]];

  const tab = sheet.getSheetByName(tabName);
  if (tab === null) return tabEmpty;
  const tabRange = tab.getRange(1, 1, tab.getMaxRows(), tab.getMaxColumns());
  const tabValues = tabRange.getValues();

  return tabValues;
};

export const cellToNumber = (cell: CellValue, nanValue = 0) => {
  if (cell === undefined) return 0;
  if (typeof cell === "number") return cell;
  if (typeof cell === "boolean") return cell ? 1 : 0;
  if (typeof cell !== "string") return cell.getTime();

  const parsedCell = parseFloat(cell);
  if (isNaN(parsedCell)) return nanValue;
  return parsedCell;
};

export const cellToString = (cell: CellValue) => (cell ?? "").toString();

export const cellToBool = (cell: CellValue) => {
  if (cell === undefined) return false;
  if (typeof cell === "boolean") return cell;
  if (typeof cell === "number") return cell === 0 ? false : true;
  if (typeof cell !== "string") return false;

  return cell.match(/true/i) ? true : false;
};

export const cellToDate = (cell: CellValue) => {
  if (cell === undefined || typeof cell === "boolean") return "";
  const newDate = new Date(cell);
  if (newDate.toString() === "Invalid Date") return "";

  return newDate;
};

export const getGoogleSpreadsheetAsExcel = (spreadsheetId: string) => {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  const url =
    "https://docs.google.com/feeds/download/spreadsheets/Export?key=" +
    ss.getId() +
    "&exportFormat=xlsx";

  const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "get",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  };

  const blob = UrlFetchApp.fetch(url, params).getBlob();

  blob.setName(ss.getName() + ".xlsx");

  return blob;
};
