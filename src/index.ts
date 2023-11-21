/* eslint-disable @typescript-eslint/no-unused-vars */
import { uberLogger } from "./lib/uberLogger";

const onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("SCRIPTS")
    .addItem("🔁 example", "runExampleMenuItem")
    .addToUi();
};

const runExampleMenuItem = () => {
  uberLogger.init({ tabName: "LOGS" });
  try {
    // your call to usecase here
  } catch (error) {
    uberLogger.error((error as Error).toString());
  }
};
