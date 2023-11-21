export class PopUpTools {
  static DisplayPopUpLoading(title: string, loadingText = "") {
    const htmlTemplate =
      HtmlService.createTemplateFromFile("PopUpLoading.html");
    htmlTemplate.dataFromServerTemplate = {
      loadingText: loadingText,
    };

    const html = htmlTemplate.evaluate().setWidth(400).setHeight(300);

    SpreadsheetApp.getUi().showModalDialog(html, title);
  }

  static DisplayPopUpEnd(title: string, greenMessage = "", normalMessage = "") {
    const htmlTemplate = HtmlService.createTemplateFromFile("PopUpEnd.html");
    htmlTemplate.dataFromServerTemplate = {
      greenMessage: greenMessage,
      normalMessage: normalMessage,
    };

    const html = htmlTemplate.evaluate().setWidth(400).setHeight(300);

    SpreadsheetApp.getUi().showModalDialog(html, title);
  }

  static DisplayPopUpError(error: string) {
    const htmlTemplate = HtmlService.createTemplateFromFile("PopUpError.html");

    htmlTemplate.dataFromServerTemplate = { error: error };

    const html = htmlTemplate.evaluate().setWidth(400).setHeight(300);

    SpreadsheetApp.getUi().showModalDialog(html, "Une erreur est survenue");
  }
}
