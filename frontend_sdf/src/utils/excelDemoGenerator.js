import { utils as XLSXUtils, writeFile } from "xlsx";

export const generateExcelDemo = (data, sheetName, fileName) => {
  const ws = XLSXUtils.json_to_sheet(data);
  const wb = XLSXUtils.book_new();

  XLSXUtils.book_append_sheet(wb, ws, sheetName);
  writeFile(wb, fileName);
};