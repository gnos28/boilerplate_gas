export const dateToString = (date: Date | "") => {
  if (date === "") return "";
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
};

export const dateToStringYYYYMMDD = (date: Date | "", separator = "") => {
  if (date === "") return "";
  return `${date.getFullYear()}${separator}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${separator}${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;
};

export const dateToStringYYYYMMDDhhmmss = (date: Date | "") => {
  if (date === "") return "";
  return `${dateToStringYYYYMMDD(date)} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
};

export const convertToHash = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
