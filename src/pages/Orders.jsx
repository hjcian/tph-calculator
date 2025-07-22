import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Button,
  Typography,
  Stack,
  Box,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FixedSizeGrid as Grid } from 'react-window';
import { parseExcelFile } from './ParseExcelFile';

// -----------------------------------------------------------------------------
// Config: column header names we expect in the Excel file
// -----------------------------------------------------------------------------
const ORDER_FIELD = '單號';       // row dimension
const PRODUCT_FIELD = '品號';     // column dimension
const QTY_FIELD = '出貨數量';     // numeric value
const TOTAL_LABEL = '總計';

// -----------------------------------------------------------------------------
// Pivot builder (row = 單號, col = 品號, val = 出貨數量)
// Produces row & column totals and returns { columns, rows }.
// columns = [...unique 品號..., '總計']
// rows = [ {rowLabel: 單號, <col vals>..., '總計': #}, ..., totalRow ]
// -----------------------------------------------------------------------------
function createPivot(data, rowKey, colKey, valueKey) {
  const rowMap = {};
  const colSet = new Set();

  for (const row of data) {
    const r = row[rowKey];
    const c = row[colKey];
    const v = Number(row[valueKey]) || 0;

    if (!rowMap[r]) rowMap[r] = {};
    rowMap[r][c] = (rowMap[r][c] || 0) + v;
    colSet.add(c);
  }

  // sort columns numeric-aware then string
  const columns = Array.from(colSet).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    const aNaN = Number.isNaN(na);
    const bNaN = Number.isNaN(nb);
    if (!aNaN && !bNaN) return na - nb;
    return String(a).localeCompare(String(b));
  });

  // assemble rows
  const outRows = Object.entries(rowMap).map(([rowLabel, values]) => {
    const rec = { rowLabel };
    for (const col of columns) {
      rec[col] = values[col] || 0;
    }
    return rec;
  });

  // add totals
  return addTotals(outRows, columns);
}

function addTotals(rows, columns) {
  const colTotals = new Array(columns.length).fill(0);
  const rowsWithTotals = rows.map((r) => {
    let sum = 0;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const v = Number(r[col]) || 0;
      sum += v;
      colTotals[i] += v;
    }
    return { ...r, [TOTAL_LABEL]: sum };
  });

  const grandTotal = colTotals.reduce((a, b) => a + b, 0);
  const totalRow = { rowLabel: TOTAL_LABEL };
  for (let i = 0; i < columns.length; i++) {
    totalRow[columns[i]] = colTotals[i];
  }
  totalRow[TOTAL_LABEL] = grandTotal;

  const columnsPlus = [...columns, TOTAL_LABEL];
  const allRows = [...rowsWithTotals, totalRow];
  return { columns: columnsPlus, rows: allRows };
}

// -----------------------------------------------------------------------------
// Virtualized pivot grid using react-window
// -----------------------------------------------------------------------------
function VirtualPivotGrid({
  pivot,
  height = 600,
  cellWidth = 80,
  headerHeight = 32,
  rowHeight = 28,
}) {
  const { columns, rows } = pivot;
  const columnCount = columns.length + 1; // +1 for row label col
  const rowCount = rows.length + 1;       // +1 for header row

  // total rendered grid height uses header rowHeight for rowIndex 0
  const getRowHeight = (index) => (index === 0 ? headerHeight : rowHeight);

  // react-window FixedSizeGrid wants constant rowHeight; to get different header height,
  // we’ll just use the *larger* of the two and visually center. Simpler & fast.
  // If you want true variable size grid, use VariableSizeGrid. Let's do that:
  // (Switch to VariableSizeGrid if you really need mixed heights.)
  //
  // For now, we’ll just use FixedSizeGrid w/ rowHeight = rowHeight,
  // and style header w/ lineHeight to look taller if desired.

  const Cell = ({ columnIndex, rowIndex, style }) => {
    // Derive value
    let content;
    let isHeader = false;
    let isRowHeader = false;
    let isColHeader = false;
    let isTotalCell = false;

    if (rowIndex === 0 && columnIndex === 0) {
      // top-left header cell
      content = ORDER_FIELD;
      isHeader = true;
    } else if (rowIndex === 0) {
      // column headers
      content = columns[columnIndex - 1];
      isHeader = true;
      isColHeader = true;
    } else if (columnIndex === 0) {
      // row headers
      content = rows[rowIndex - 1].rowLabel;
      isHeader = true;
      isRowHeader = true;
    } else {
      const rowObj = rows[rowIndex - 1];
      const colKey = columns[columnIndex - 1];
      const val = rowObj[colKey];
      content = formatNumberCell(val);
      if (rowObj.rowLabel === TOTAL_LABEL || colKey === TOTAL_LABEL) {
        isTotalCell = true;
      }
    }

    const base = {
      ...style,
      boxSizing: 'border-box',
      padding: '2px 4px',
      borderBottom: '1px solid rgba(0,0,0,0.12)',
      borderRight: '1px solid rgba(0,0,0,0.12)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 12,
      lineHeight: `${rowHeight}px`,
    };

    if (isHeader) {
      base.fontWeight = 'bold';
      base.background = '#f5f5f5';
    }
    if (isTotalCell) {
      base.fontWeight = 'bold';
      base.background = '#fff8e1';
    }
    if (isRowHeader && content === TOTAL_LABEL) {
      base.background = '#fff8e1';
    }
    if (isColHeader && content === TOTAL_LABEL) {
      base.background = '#fff8e1';
    }

    // align numbers right, labels left
    const alignRight =
      !isHeader &&
      content !== '' &&
      !Number.isNaN(Number(String(content).replace(/,/g, '')));

    base.textAlign = alignRight ? 'right' : 'left';

    return <div style={base}>{content}</div>;
  };

  // width: let grid scroll horizontally if many columns
  const width = columnCount * cellWidth;
  // you can cap width to container width: wrap in Box w/ overflow:auto if desired

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', overflow: 'auto', width: '100%' }}>
      <Grid
        columnCount={columnCount}
        columnWidth={cellWidth}
        height={height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={width < 1200 ? width : 1200} // show scrollbar if wider than 800px; tweak as needed
      >
        {Cell}
      </Grid>
    </Box>
  );
}

// number formatting: blank for 0 to reduce noise, comma for >999
function formatNumberCell(val) {
  const n = Number(val);
  if (!Number.isFinite(n) || n === 0) return '';
  return Intl.NumberFormat().format(n);
}

// -----------------------------------------------------------------------------
// Orders component
// -----------------------------------------------------------------------------
export default function Orders({
  label = 'Choose File',
  accept = '.xls,.xlsx,.xlsm,.csv',
}) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState('');

  const handleFileChange = async (event) => {
    setErrorMsg('');
    const file = event.target.files[0];
    setFileName(file ? file.name : '');
    if (!file) return;

    try {
      setLoading(true);
      const parsed = await parseExcelFile(file);
      setExcelData(parsed);
      const first = parsed.sheetNames[0];
      setActiveSheet(first);
    } catch (err) {
      console.error('Excel parse error:', err);
      setErrorMsg('Failed to read file. Is it a valid Excel/CSV?');
      setExcelData(null);
    } finally {
      setLoading(false);
    }
  };

  // current sheet
  const sheetRows = excelData?.sheets?.[activeSheet]?.rows ?? [];
  const sheetHeaders = sheetRows[0] || [];
  const dataRows = sheetRows.slice(1);

  // locate required columns
  const idxOrder = sheetHeaders.indexOf(ORDER_FIELD);
  const idxProduct = sheetHeaders.indexOf(PRODUCT_FIELD);
  const idxQty = sheetHeaders.indexOf(QTY_FIELD);
  const hasNeededCols = idxOrder >= 0 && idxProduct >= 0 && idxQty >= 0;

  // map to objects
  const dataObjects = useMemo(() => {
    if (!hasNeededCols) return [];
    return dataRows.map((r) => ({
      [ORDER_FIELD]: r[idxOrder],
      [PRODUCT_FIELD]: r[idxProduct],
      [QTY_FIELD]: r[idxQty],
    }));
  }, [dataRows, idxOrder, idxProduct, idxQty, hasNeededCols]);

  // build pivot
  const pivotData = useMemo(() => {
    if (!dataObjects.length) return null;
    return createPivot(dataObjects, ORDER_FIELD, PRODUCT_FIELD, QTY_FIELD);
  }, [dataObjects]);

  // Display count from first sheet (matches your earlier UI)
  const firstSheetName = excelData?.sheetNames?.[0] ?? '';
  const firstSheetRows = firstSheetName ? excelData?.sheets[firstSheetName]?.rows || [] : [];
  const firstSheetRowCount = Math.max(0, firstSheetRows.length - 1);

  return (
    <Stack spacing={3}>
      {/* File Input */}
      <Stack direction="row" spacing={2} alignItems="center">
        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
        >
          {loading ? 'Reading…' : label}
        </Button>
        {loading && <CircularProgress size={20} />}
        {fileName && <Typography variant="body2">{fileName}</Typography>}
        {errorMsg && (
          <Typography variant="body2" color="error">
            {errorMsg}
          </Typography>
        )}
      </Stack>

      {excelData && (
        <Typography variant="body1">
          結果筆數 ("{firstSheetName}"): {firstSheetRowCount}
        </Typography>
      )}

      {/* Sheet Selector */}
      {excelData && excelData.sheetNames.length > 1 && (
        <Box>
          <Typography variant="h6">Sheet:</Typography>
          <Select
            size="small"
            value={activeSheet}
            onChange={(e) => setActiveSheet(e.target.value)}
          >
            {excelData.sheetNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {/* Missing required columns */}
      {excelData && !hasNeededCols && (
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          找不到必要欄位：需要「{ORDER_FIELD}」、「{PRODUCT_FIELD}」、「{QTY_FIELD}」。
          目前標題：{sheetHeaders.join(', ')}。
        </Alert>
      )}

      {/* Pivot */}
      {pivotData && (
        <VirtualPivotGrid
          pivot={pivotData}
          height={600}
          cellWidth={80}
          headerHeight={32}
          rowHeight={28}
        />
      )}
    </Stack>
  );
}
