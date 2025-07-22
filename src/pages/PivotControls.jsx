/* ============================================================
 * PivotControls.jsx
 * UI for choosing pivot dimensions & aggregator.
 * ============================================================ */

import React from 'react';
import { Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export function PivotControls({ headers, rowKey, colKey, valueKey, agg, onChange }) {
  // headers: string[]
  // onChange({rowKey, colKey, valueKey, agg})

  const handle = (field) => (e) => {
    onChange({ rowKey, colKey, valueKey, agg, [field]: e.target.value });
  };

  const handleAgg = (e) => {
    onChange({ rowKey, colKey, valueKey, agg: e.target.value });
  };

  return (
    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Row</InputLabel>
        <Select label="Row" value={rowKey} onChange={handle('rowKey')}>
          {headers.map((h) => (
            <MenuItem key={h} value={h}>{h}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Column</InputLabel>
        <Select label="Column" value={colKey} onChange={handle('colKey')}>
          {headers.map((h) => (
            <MenuItem key={h} value={h}>{h}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Value</InputLabel>
        <Select label="Value" value={valueKey} onChange={handle('valueKey')}>
          {headers.map((h) => (
            <MenuItem key={h} value={h}>{h}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Aggregator</InputLabel>
        <Select label="Aggregator" value={agg} onChange={handleAgg}>
          <MenuItem value="sum">Sum</MenuItem>
          <MenuItem value="count">Count</MenuItem>
          <MenuItem value="avg">Average</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
