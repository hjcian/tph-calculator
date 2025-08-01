import React, { useRef, useState, useMemo } from 'react';
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { parseExcelFile } from './ParseExcelFile';

const ORDER_FIELD = '單號';        // row
const PRODUCT_FIELD = '品號';      // column
const QTY_FIELD = '出貨數量';      // numeric value
const TOTAL_LABEL = '總計';
const COUNT_LABEL = '品項數量';

function parseAsDate(value) {
  if (value instanceof Date && !isNaN(value)) return value;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = value * 86400000; // days -> ms
    const d = new Date(excelEpoch.getTime() + ms);
    return isNaN(d) ? null : d;
  }

  if (typeof value === 'string') {
    const d = dayjs(value);
    if (d.isValid()) return d.toDate();

    const nd = new Date(value);
    return isNaN(nd) ? null : nd;
  }

  return null;
}

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

  // Sort columns numeric-aware
  const columns = Array.from(colSet).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });

  const outRows = Object.entries(rowMap).map(([rowLabel, values]) => {
    const rec = { rowLabel };
    for (const col of columns) {
      rec[col] = values[col] || 0;
    }
    return rec;
  });

  return addTotalsAndCounts(outRows, columns);
}

/**
 * Adds row totals, column totals, and a count column.
 */
function addTotalsAndCounts(rows, columns) {
  const colTotals = new Array(columns.length).fill(0);

  const rowsWithTotals = rows.map((r) => {
    let sum = 0;
    let nonZeroCount = 0;

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const v = Number(r[col]) || 0;
      sum += v;
      colTotals[i] += v;
      if (v !== 0) nonZeroCount += 1;
    }

    return { ...r, [TOTAL_LABEL]: sum, [COUNT_LABEL]: nonZeroCount };
  });



  // Column totals
  const totalRow = { rowLabel: TOTAL_LABEL };
  let totalRowNonZeroCount = 0;
  for (let i = 0; i < columns.length; i++) {
    const colTotal = colTotals[i];
    totalRow[columns[i]] = colTotal;
    if (colTotal !== 0) totalRowNonZeroCount += 1;
  }

  const grandTotal = colTotals.reduce((a, b) => a + b, 0);

  // Sum of all row counts
  const units = rowsWithTotals.reduce((sum, r) => sum + (r[COUNT_LABEL] || 0), 0);

  totalRow[TOTAL_LABEL] = grandTotal;
  totalRow[COUNT_LABEL] = units;

  return {
    columns: [...columns, TOTAL_LABEL, COUNT_LABEL],
    rows: [...rowsWithTotals, totalRow],
    grandTotal,
    units,
    totalRowNonZeroCount,
  };
}

function VirtualPivotGrid({
  pivot,
  height = 1000,
  cellWidth = 80,
  headerHeight = 32,
  rowHeight = 28,
}) {
  const { columns, rows } = pivot;

  const columnCount = columns.length + 1;
  const rowCount = rows.length + 1;

  const Cell = ({ columnIndex, rowIndex, style }) => {
    let content;
    let isHeader = false;
    let isSpecial = false;

    if (rowIndex === 0 && columnIndex === 0) {
      content = `${ORDER_FIELD}\\${PRODUCT_FIELD}`;
      isHeader = true;
    } else if (rowIndex === 0) {
      content = columns[columnIndex - 1];
      isHeader = true;
      if (content === TOTAL_LABEL || content === COUNT_LABEL) isSpecial = true;
    } else if (columnIndex === 0) {
      const rowObj = rows[rowIndex - 1];
      content = rowObj.rowLabel;
      isHeader = true;
      if (content === TOTAL_LABEL) isSpecial = true;
    } else {
      const rowObj = rows[rowIndex - 1];
      const colKey = columns[columnIndex - 1];
      const val = rowObj[colKey];
      content = colKey === COUNT_LABEL
        ? (val === 0 ? '' : String(val))
        : formatNumberCell(val);
      if (rowObj.rowLabel === TOTAL_LABEL || colKey === TOTAL_LABEL || colKey === COUNT_LABEL) {
        isSpecial = true;
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
      fontWeight: isHeader ? 'bold' : 'normal',
      background: isSpecial ? '#fff8e1' : isHeader ? '#f5f5f5' : 'white',
      textAlign: (!isHeader && content !== '' && !Number.isNaN(Number(String(content).replace(/,/g, ''))))
        ? 'right'
        : 'left',
    };

    return <div style={base}>{content}</div>;
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
      <Grid
        columnCount={columnCount}
        columnWidth={cellWidth}
        height={height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={1100}
      >
        {Cell}
      </Grid>
    </Box>
  );
}

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
  const [selectedDate, setSelectedDate] = useState(null);

  const handleFileChange = async (event) => {
    setErrorMsg('');
    const file = event.target.files[0];
    setFileName(file ? file.name : '');
    if (!file) return;

    try {
      setLoading(true);
      const parsed = await parseExcelFile(file);
      setExcelData(parsed);
      const targetSheet =
        parsed.sheetNames.find((name) => name.includes('出貨明細')) ?? parsed.sheetNames[0];
      setActiveSheet(targetSheet);
    } catch (err) {
      console.error('Excel parse error:', err);
      setErrorMsg('Failed to read file. Is it a valid Excel/CSV?');
      setExcelData(null);
    } finally {
      setLoading(false);
    }
  };

  const sheetRows = excelData?.sheets?.[activeSheet]?.rows ?? [];
  const sheetHeaders = sheetRows[0] || [];

  const idxOrder = sheetHeaders.indexOf(ORDER_FIELD);
  const idxProduct = sheetHeaders.indexOf(PRODUCT_FIELD);
  const idxQty = sheetHeaders.indexOf(QTY_FIELD);
  const idxDate = sheetHeaders.indexOf('出貨日期');

  const hasNeededCols = idxOrder >= 0 && idxProduct >= 0 && idxQty >= 0;

  const uniqueDates = useMemo(() => {
    if (idxDate < 0 || sheetRows.length <= 1) return [];
    const s = new Set();
    for (let i = 1; i < sheetRows.length; i++) {
      const d = parseAsDate(sheetRows[i][idxDate]);
      if (d) s.add(dayjs(d).format('YYYY-MM-DD'));
    }
    return Array.from(s).sort();
  }, [sheetRows, idxDate]);

  const filteredRows = useMemo(() => {
    if (sheetRows.length <= 1) return sheetRows;
    if (idxDate < 0) return sheetRows;
    if (!selectedDate) return sheetRows;
    return sheetRows.filter((row, i) => {
      if (i === 0) return true;
      const d = parseAsDate(row[idxDate]);
      return d && dayjs(d).isSame(selectedDate, 'day');
    });
  }, [sheetRows, idxDate, selectedDate]);

  const dataRows = filteredRows.slice(1);

  const dataObjects = useMemo(() => {
    if (!hasNeededCols) return [];
    return dataRows.map((r) => ({
      [ORDER_FIELD]: r[idxOrder],
      [PRODUCT_FIELD]: r[idxProduct],
      [QTY_FIELD]: r[idxQty],
    }));
  }, [dataRows, idxOrder, idxProduct, idxQty, hasNeededCols]);

  const pivotData = useMemo(() => {
    if (!dataObjects.length) return null;
    return createPivot(dataObjects, ORDER_FIELD, PRODUCT_FIELD, QTY_FIELD);
  }, [dataObjects]);

  const productList = excelData?.sheetNames?.find((name) => name.includes('品號表'));
  const productListRows = productList ? excelData?.sheets[productList]?.rows || [] : [];
  const productListRowCount = Math.max(0, productListRows.length - 1);
  const filteredCount = Math.max(0, filteredRows.length - 1);

  const uniqueOrderCount = useMemo(() => {
    if (!hasNeededCols || filteredRows.length <= 1) return 0;
    const set = new Set();
    for (let i = 1; i < filteredRows.length; i++) {
      set.add(filteredRows[i][idxOrder]);
    }
    return set.size;
  }, [filteredRows, idxOrder, hasNeededCols]);

  const monthlyAverages = useMemo(() => {
    if (!hasNeededCols || filteredRows.length <= 1 || idxDate < 0) return [];

    // Step 1: Collect unique 單號 per day
    const dailyOrders = {}; // { "2025-07-01": Set(單號1, 單號2, ...) }

    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const date = parseAsDate(row[idxDate]);
      if (!date) continue;

      const dayKey = dayjs(date).format('YYYY-MM-DD');
      if (!dailyOrders[dayKey]) dailyOrders[dayKey] = new Set();
      dailyOrders[dayKey].add(row[idxOrder]);
    }

    // Step 2: Aggregate daily counts into monthly totals
    const monthlyTotals = {};
    const monthlyDayCounts = {};

    Object.keys(dailyOrders).forEach((dayKey) => {
      const monthKey = dayKey.slice(0, 7); // YYYY-MM
      const dayCount = dailyOrders[dayKey].size;

      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + dayCount;
      monthlyDayCounts[monthKey] = (monthlyDayCounts[monthKey] || 0) + 1;
    });

    // Step 3: Compute average 單 per day for each month
    return Object.keys(monthlyTotals).sort().map((month) => ({
      month,
      avg: (monthlyTotals[month] / monthlyDayCounts[month]).toFixed(2), // 2 decimal places
    }));
  }, [filteredRows, idxDate, idxOrder, hasNeededCols]);

  const monthlySKUAverages = useMemo(() => {
    if (!hasNeededCols || filteredRows.length <= 1 || idxDate < 0 || idxProduct < 0 || idxQty < 0) return [];

    // Step 1: group rows by date
    const dailyData = {};
    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const date = parseAsDate(row[idxDate]);
      if (!date) continue;
      const dayKey = dayjs(date).format('YYYY-MM-DD');
      if (!dailyData[dayKey]) dailyData[dayKey] = [];
      dailyData[dayKey].push(row);
    }

    // Step 2: for each day, count distinct products with non-zero quantity
    const dailyProductCounts = {};
    for (const [dayKey, rows] of Object.entries(dailyData)) {
      const productSet = new Set();
      for (const row of rows) {
        const qty = Number(row[idxQty]) || 0;
        if (qty !== 0) {
          productSet.add(row[idxProduct]);
        }
      }
      dailyProductCounts[dayKey] = productSet.size;
    }

    // Step 3: group by month and calculate average product count
    const monthlyTotals = {};
    const monthlyDays = {};

    for (const [dayKey, count] of Object.entries(dailyProductCounts)) {
      const monthKey = dayKey.slice(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + count;
      monthlyDays[monthKey] = (monthlyDays[monthKey] || 0) + 1;
    }

    return Object.keys(monthlyTotals).sort().map((month) => ({
      month,
      avgProducts: (monthlyTotals[month] / monthlyDays[month]).toFixed(2),
    }));
  }, [filteredRows, idxDate, idxProduct, idxQty, hasNeededCols]);

  const monthlyCountAverages = useMemo(() => {
    if (!hasNeededCols || filteredRows.length <= 1 || idxDate < 0 || idxOrder < 0 || idxProduct < 0 || idxQty < 0) return [];

    // Step 1: group rows by date and order
    const dailyOrderMap = {}; // { "2025-07-15": { order1: Set(products), order2: Set(products) } }

    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const date = parseAsDate(row[idxDate]);
      const order = row[idxOrder];
      const product = row[idxProduct];
      const qty = Number(row[idxQty]) || 0;

      if (!date || !order || qty === 0) continue;

      const dayKey = dayjs(date).format('YYYY-MM-DD');
      if (!dailyOrderMap[dayKey]) dailyOrderMap[dayKey] = {};
      if (!dailyOrderMap[dayKey][order]) dailyOrderMap[dayKey][order] = new Set();

      dailyOrderMap[dayKey][order].add(product);
    }

    // Step 2: sum up 品項數量 per order per day
    const dailyCountA = {}; // { "2025-07-15": [3, 5, 4] }
    for (const [dayKey, orders] of Object.entries(dailyOrderMap)) {
      dailyCountA[dayKey] = Object.values(orders).map((productSet) => productSet.size);
    }

    // Step 3: group by month and compute average
    const monthlyTotals = {};
    const monthlyCounts = {};

    for (const [dayKey, counts] of Object.entries(dailyCountA)) {
      const monthKey = dayKey.slice(0, 7);
      const sum = counts.reduce((a, b) => a + b, 0);
      const count = counts.length;

      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + sum;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + count;
    }

    return Object.keys(monthlyTotals).sort().map((month) => ({
      month,
      avgCountA: (monthlyTotals[month] / monthlyCounts[month]).toFixed(2),
    }));
  }, [filteredRows, idxDate, idxOrder, idxProduct, idxQty, hasNeededCols]);

  const avgUnitsPerMonth = useMemo(() => {
    if (!hasNeededCols || filteredRows.length <= 1 || idxDate < 0 || idxOrder < 0 || idxQty < 0) return [];

    const monthlyTotals = {};
    const monthlyOrderSets = {};

    for (let i = 1; i < filteredRows.length; i++) {
      const row = filteredRows[i];
      const date = parseAsDate(row[idxDate]);
      const order = row[idxOrder];
      const qty = Number(row[idxQty]) || 0;

      if (!date || !order) continue;

      const monthKey = dayjs(date).format('YYYY-MM');

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = 0;
        monthlyOrderSets[monthKey] = new Set();
      }

      monthlyTotals[monthKey] += qty;
      monthlyOrderSets[monthKey].add(order);
    }

    return Object.entries(monthlyTotals).map(([month, totalUnits]) => ({
      month,
      avgUnits: (totalUnits / monthlyOrderSets[month].size).toFixed(2),
      totalUnits,
      orderCount: monthlyOrderSets[month].size,
    }));
  }, [filteredRows, idxDate, idxOrder, idxQty, hasNeededCols]);




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
          結果筆數 ("{productList}"): {productListRowCount}
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
            sx={{ minWidth: 240 }}
          >
            {excelData.sheetNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {/* Date Picker */}
      {sheetRows && sheetRows.length > 1 && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">日期:</Typography>
            <Select
              size="small"
              value={selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : ''}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedDate(v === '' ? null : dayjs(v));
              }}
              displayEmpty
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">
                <em>全部日期 All Dates</em>
              </MenuItem>
              {uniqueDates.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
            <DatePicker
              label="選擇日期"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="YYYY-MM-DD"
              slotProps={{ textField: { size: 'small' } }}
            />
          </Stack>
        </LocalizationProvider>
      )}

      {sheetRows.length > 1 && (
        <Typography variant="body2" color="text.secondary">
          篩選後筆數: {filteredCount}
        </Typography>
      )}

      {excelData && !hasNeededCols && (
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          找不到必要欄位：需要「{ORDER_FIELD}」、「{PRODUCT_FIELD}」、「{QTY_FIELD}」。
          目前標題：{sheetHeaders.join(', ')}。
        </Alert>
      )}

      {pivotData && (
        <>
          <Typography variant="body2">出貨總量: {pivotData.grandTotal.toLocaleString()}</Typography>
          <Typography variant="body2">品項總數合計: {pivotData.units.toLocaleString()}</Typography>
          <Typography variant="body2">篩選後單號數: {uniqueOrderCount}</Typography>

          {monthlyAverages.length > 0 && (
            <Box>
              <Typography variant="h6">每月平均單數 (每日平均)</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {monthlyAverages.map((m) => (
                  <Typography key={m.month} variant="body2">
                    {m.month}: {m.avg} 單/天
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {monthlySKUAverages.length > 0 && (
            <Box>
              <Typography variant="h6">每月平均品項數量 (每日)</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {monthlySKUAverages.map((m) => (
                  <Typography key={m.month} variant="body2">
                    {m.month}: {m.avgProducts} 品項/天
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {monthlyCountAverages.length > 0 && (
            <Box>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {monthlyCountAverages.map((m) => (
                  <Typography key={m.month} variant="body2">
                    {m.month}: {m.avgCountA} sku/單
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {avgUnitsPerMonth.length > 0 && (
            <Box>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {avgUnitsPerMonth.map((m) => (
                  <Typography key={m.month} variant="body2">
                    {m.month}: {m.avgUnits} units/單
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {avgUnitsPerMonth.length > 0 && monthlyCountAverages.length > 0 && (
            <Box>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {avgUnitsPerMonth.map((m) => {
                  const match = monthlyCountAverages.find((x) => x.month === m.month);
                  if (!match) return null;

                  const units = parseFloat(m.avgUnits);
                  const skus = parseFloat(match.avgCountA);
                  const unitsPerSku = skus > 0 ? (units / skus).toFixed(2) : '—';

                  return (
                    <Typography key={m.month} variant="body2">
                      {m.month}: {unitsPerSku} units/skus
                    </Typography>
                  );
                })}
              </Stack>
            </Box>
          )}


          <VirtualPivotGrid
            pivot={pivotData}
            height={600}
            cellWidth={80}
            rowHeight={28}
          />
        </>
      )}


      {!loading && excelData && !pivotData && (
        <Typography variant="body2" color="text.secondary">
          沒有符合日期的資料。
        </Typography>
      )}
    </Stack>
  );
}
