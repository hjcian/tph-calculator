export function buildPivot({ data, rowKey, colKey, valueKey, agg = 'sum' }) {
  // data: Array<Record<string, any>>
  // rowKey, colKey, valueKey: string (header names)
  // agg: 'sum' | 'count' | 'avg' | custom function({existing, val})
  // returns: { rowValues, colValues, matrix, rowTotals, colTotals, grandTotal }

  const rowSet = new Set();
  const colSet = new Set();

  // We'll store partial aggregates in a Map keyed by `${r}\u0001${c}`.
  // For avg we need sum+count, so we store {sum, count} always, then post-process.
  const cellAgg = new Map();

  for (const rec of data) {
    const r = rec[rowKey];
    const c = rec[colKey];
    rowSet.add(r);
    colSet.add(c);

    const vRaw = rec[valueKey];
    const v = typeof vRaw === 'number' ? vRaw : Number(vRaw);
    const key = r + '\u0001' + c;
    let aggObj = cellAgg.get(key);
    if (!aggObj) {
      aggObj = { sum: 0, count: 0 };
      cellAgg.set(key, aggObj);
    }
    if (!Number.isNaN(v)) {
      aggObj.sum += v;
      aggObj.count += 1;
    } else {
      // if non-numeric and agg === 'count', still count the row
      if (agg === 'count') {
        aggObj.count += 1;
      }
    }
  }

  const rowValues = Array.from(rowSet.values());
  const colValues = Array.from(colSet.values());

  // Sort for stable display (optional)
  rowValues.sort(defaultSort);
  colValues.sort(defaultSort);

  // Build matrix
  const matrix = rowValues.map(() => new Array(colValues.length).fill(null));
  const rowTotals = rowValues.map(() => ({ sum: 0, count: 0 }));
  const colTotals = colValues.map(() => ({ sum: 0, count: 0 }));
  const grand = { sum: 0, count: 0 };

  for (let i = 0; i < rowValues.length; i++) {
    const r = rowValues[i];
    for (let j = 0; j < colValues.length; j++) {
      const c = colValues[j];
      const key = r + '\u0001' + c;
      const aggObj = cellAgg.get(key);
      if (!aggObj) continue;
      rowTotals[i].sum += aggObj.sum;
      rowTotals[i].count += aggObj.count;
      colTotals[j].sum += aggObj.sum;
      colTotals[j].count += aggObj.count;
      grand.sum += aggObj.sum;
      grand.count += aggObj.count;
      matrix[i][j] = finalizeAgg(aggObj, agg);
    }
  }

  // finalize totals
  const rowTotalsFinal = rowTotals.map((o) => finalizeAgg(o, agg));
  const colTotalsFinal = colTotals.map((o) => finalizeAgg(o, agg));
  const grandTotal = finalizeAgg(grand, agg);

  return { rowValues, colValues, matrix, rowTotals: rowTotalsFinal, colTotals: colTotalsFinal, grandTotal };
}

function defaultSort(a, b) {
  // numeric-aware, fallback to string
  const aNum = Number(a);
  const bNum = Number(b);
  const aNaN = Number.isNaN(aNum);
  const bNaN = Number.isNaN(bNum);
  if (!aNaN && !bNaN) return aNum - bNum;
  return String(a).localeCompare(String(b));
}

function finalizeAgg({ sum, count }, agg) {
  switch (agg) {
    case 'sum':
      return sum;
    case 'count':
      return count;
    case 'avg':
      return count === 0 ? null : sum / count;
    default:
      // Custom aggregator string not recognized; return sum.
      return sum;
  }
}