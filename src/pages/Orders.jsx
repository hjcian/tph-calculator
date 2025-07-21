import React, { useRef, useState } from 'react';
import { Button, Typography, Stack } from '@mui/material';

export default function Orders({ label = 'Choose File', accept=".xls,.xlsx,.xlsm,.csv", onChange }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : '');
    if (onChange) onChange(file);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button variant="contained" onClick={() => fileInputRef.current.click()}>
        {label}
      </Button>
      {fileName && <Typography variant="body2">{fileName}</Typography>}
    </Stack>
  );
}
