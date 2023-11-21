import { PopUpTools } from "./popUpLibrary";

let logRowIndex: number | undefined = undefined;
let logHeaderIndex: number | undefined = undefined;
let logTab: GoogleAppsScript.Spreadsheet.Sheet | null | undefined = undefined;
let showTimestamp = true;

type LogType = "log" | "warning" | "info" | "error";

const sheetLog = ({
  type,
  message,
  timestamp,
}: {
  type: LogType;
  message: string;
  timestamp: string;
}) => {
  if (logTab === null || logTab === undefined || logRowIndex === undefined)
    return;

  const logRange = logTab.getRange(logRowIndex, 1, 1, 3);

  logRange.setValues([
    [type.toUpperCase(), timestamp, message.slice(0, 50000)],
  ]);

  SpreadsheetApp.flush();

  logRowIndex++;
};

const terminalLog = ({
  type,
  message,
  timestamp,
}: {
  type: LogType;
  message: string;
  timestamp: string;
}) => {
  if (type === "log") return console.log(timestamp, message);
  if (type === "warning") return console.warn(timestamp, message);
  if (type === "info") return console.info(timestamp, message);
  if (type === "error") {
    PopUpTools.DisplayPopUpError(`${timestamp}\n${message}`);
    return console.error(timestamp, message);
  }
};

const getTimestamp = () => {
  if (!showTimestamp) return "";
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now
    .getDate()
    .toString()
    .padStart(2, "0")} ${now.toLocaleTimeString("fr-FR")}`;
};

const genericLogger = ({
  type,
  message,
}: {
  type: LogType;
  message: unknown;
}) => {
  const timestamp = getTimestamp();

  const messageString =
    typeof message === "string" ? message : JSON.stringify(message);

  try {
    if (process.env.NODE_ENV !== "test")
      terminalLog({ type, message: messageString, timestamp });
  } catch (error) {
    terminalLog({ type, message: messageString, timestamp });
  }

  sheetLog({ type, message: messageString, timestamp });
};

export const uberLogger = {
  init: ({
    tabName,
    noTimestamp,
  }: {
    tabName: string;
    noTimestamp?: boolean;
  }) => {
    logTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
    if (logTab === undefined || logTab === null) return;

    const firstColValues = logTab
      .getRange(1, 1, logTab.getMaxRows(), 1)
      .getValues();

    logHeaderIndex = firstColValues.findIndex(
      (row) => (row[0].toString() as string).toLowerCase() === "logs"
    );

    if (logHeaderIndex === -1) {
      logHeaderIndex = undefined;
      return;
    }

    showTimestamp = !noTimestamp;

    logRowIndex = logHeaderIndex + 2;

    logTab
      .getRange(
        logRowIndex,
        1,
        logTab.getMaxRows() - logRowIndex,
        logTab.getMaxColumns()
      )
      .clearContent();
  },

  log: (message: unknown) => {
    const type: LogType = "log";

    genericLogger({ type, message });
  },
  warn: (message: unknown) => {
    const type: LogType = "warning";

    genericLogger({ type, message });
  },
  info: (message: unknown) => {
    const type: LogType = "info";

    genericLogger({ type, message });
  },
  error: (message: unknown) => {
    const type: LogType = "error";

    genericLogger({ type, message });
  },
};
