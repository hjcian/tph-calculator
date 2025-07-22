import ExcelJS from 'exceljs';

export async function parseExcelFile(file) {
  const ab = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  const convertValue = (val) => {
    if (val instanceof Date) return val.toLocaleDateString();
    return val;
  };

  if (file.name.toLowerCase().endsWith('.csv')) {
    await workbook.csv.read(new Uint8Array(ab));
  } else {
    await workbook.xlsx.load(ab);
  }

  const sheetNames = workbook.worksheets.map((ws) => ws.name);
  const sheets = {};

  workbook.worksheets.forEach((ws) => {
    const rows = [];
    ws.eachRow({ includeEmpty: true }, (row) => {
      rows.push(row.values.slice(1).map(convertValue));
    });
    sheets[ws.name] = { rows };
  });

  return { sheetNames, sheets };
}