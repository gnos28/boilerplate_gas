import { mimeTypeGoogle } from "./mimeTypeGoogle";

export type FileItem = {
  id: string;
  mimeType: string;
  name: string;
  lastUpdatedTime: number;
};

export type FolderItem = {
  id: string;
  name: string;
  lastUpdatedTime: number;
};

export const getFileList = (
  fileIterator: GoogleAppsScript.Drive.FileIterator
): FileItem[] => {
  if (fileIterator.hasNext()) {
    const file = fileIterator.next();

    const fileItem = {
      id: file.getId(),
      mimeType: file.getMimeType(),
      name: file.getName(),
      lastUpdatedTime: file.getLastUpdated().getTime(),
    };

    return [fileItem, ...getFileList(fileIterator)];
  }
  return [];
};

export const getFolderList = (
  folderIterator: GoogleAppsScript.Drive.FolderIterator
): FolderItem[] => {
  if (folderIterator.hasNext()) {
    const folder = folderIterator.next();

    const folderItem = {
      id: folder.getId(),
      name: folder.getName(),
      lastUpdatedTime: folder.getLastUpdated().getTime(),
    };

    return [folderItem, ...getFolderList(folderIterator)];
  }
  return [];
};

export const convertExcelToSheet = (
  file: Pick<FileItem, "name" | "id">,
  destFolder: GoogleAppsScript.Drive.Folder
) => {
  const config = {
    title: file.name,
    parents: [{ id: destFolder.getId() }],
    mimeType: mimeTypeGoogle.GOOGLE_SHEETS,
  };

  const blob = DriveApp.getFileById(file.id).getBlob();

  const convertedSheet = Drive.Files?.insert(config, blob, {
    convert: true,
    supportsAllDrives: true,
  });

  return convertedSheet?.id;
};

/**
 * for each file that is xls or xlsx create a new folder & put file inside of it after converting it to sheet
 */
export const handleRawExcelFile = (
  file: FileItem,
  CSV_OUTPUT_FOLDER_ID: string
) => {
  const goodMimes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!goodMimes.includes(file.mimeType)) return;

  // create new folder
  const now = new Date();
  const parentFolder = DriveApp.getFolderById(CSV_OUTPUT_FOLDER_ID);
  const newFolder = parentFolder.createFolder(
    `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now
      .getDate()
      .toString()
      .padStart(2, "0")} ${now.toLocaleTimeString("fr-FR")} ${file.name}`
  );

  // convert excel to sheet and return sheetId
  const sheetId = convertExcelToSheet(file, newFolder);

  // delete useless excel file
  DriveApp.getFileById(file.id).setTrashed(true);

  return { sheetId, folderId: newFolder.getId() };
};
