/* ============================================================
 * PivotTable.jsx
 * Simple MUI Table renderer for pivot results.
 * For very large pivot *grids* (many unique row/col members) you should
 * render with virtualization (react-window); see note below.
 * ============================================================ */

import React from 'react';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';

export function PivotTable({ pivot, formatter = defaultFormatter, height = 500 }) {
  const { rowValues, colValues, matrix, rowTotals, colTotals, grandTotal } = pivot;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto', maxHeight: height, border: '1px solid', borderColor: 'divider' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {/* top-left corner cell */}
            <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'background.paper' }}>Row \\ Col</TableCell>
            {colValues.map((c) => (
              <TableCell key={c} align="right" sx={{ fontWeight: 'bold' }}>{String(c)}</TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Row Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowValues.map((r, i) => (
            <TableRow key={r}>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper', fontWeight: 'bold' }}>{String(r)}</TableCell>
              {colValues.map((c, j) => (
                <TableCell key={c} align="right">{formatter(matrix[i][j])}</TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatter(rowTotals[i])}</TableCell>
            </TableRow>
          ))}
          {/* column totals */}
          <TableRow>
            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper', fontWeight: 'bold' }}>Column Total</TableCell>
            {colTotals.map((v, j) => (
              <TableCell key={j} align="right" sx={{ fontWeight: 'bold' }}>{formatter(v)}</TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatter(grandTotal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}

function defaultFormatter(v) {
  if (v == null) return '';
  if (typeof v === 'number') {
    // basic number format; customize as needed
    return Intl.NumberFormat().format(v);
  }
  return String(v);
}