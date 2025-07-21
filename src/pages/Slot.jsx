import { Typography, Stack, TextField, Button } from "@mui/material";
import { useState } from "react";

export default function Slot() {
  const [total_skus, setTotalSkus] = useState('1600');
  const [target_skus, setTargetSkus] = useState('600');
  const [slot, setSlot] = useState(4);
  const [nonZero, setNonZero] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({
    total_skus: '',
    target_skus: '',
    slot: ''
  });

  const handleDimensionChange = (field, value) => {
    const numVal = parseInt(value);
    const floatVal = parseFloat(value);
    // Update value
    if (field === 'total_skus') setTotalSkus(numVal);
    if (field === 'target_skus') setTargetSkus(numVal);
    if (field === 'slot') setSlot(numVal);
  };

  const handleGenerate = () => {
    const containers = total_skus / slot;
    console.log(containers);

    const arr = new Array(containers).fill(0);
    let remaining = target_skus;

    for (let i = 0; i < containers && remaining > 0; i++) {
      let r = Math.floor(Math.random() * 4) + 1;
      if (r > remaining) r = remaining;
      arr[i] = r;
      remaining -= r;
    }

    const zeroCount = arr.filter(v => v === 0).length;
    setNonZero(arr.length - zeroCount);
    console.log("Zeros:", zeroCount, "Non-Zeros:", nonZeroCount);
  };

  return (
    <Stack direction={'column'} gap={1}>
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        <Typography>
          SKUs 數量:
        </Typography>
        <TextField
          value={total_skus}
          onChange={(e) => handleDimensionChange('total_skus', e.target.value)}
          error={!!fieldErrors.total_skus}
          label={fieldErrors.total_skus}
          type="number"
          step="1"
          name="total_skus"
          sx={{ flex: 1 }} />
      </Stack>
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        <Typography>
          目標SKUs 數量:
        </Typography>
        <TextField
          value={target_skus}
          onChange={(e) => handleDimensionChange('target_skus', e.target.value)}
          error={!!fieldErrors.target_skus}
          label={fieldErrors.target_skus}
          type="number"
          step="1"
          name="target_skus"
          sx={{ flex: 1 }} />
      </Stack>
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        <Typography>
          Slot 數量:
        </Typography>
        <TextField
          value={slot}
          onChange={(e) => handleDimensionChange('slot', e.target.value)}
          error={!!fieldErrors.slot}
          label={fieldErrors.slot}
          type="number"
          step="1"
          name="slot"
          sx={{ flex: 1 }} />
      </Stack>
      <Button
        variant="contained"
        onClick={handleGenerate}
      >
        隨機分配 Generate Random Distribution
      </Button>
      <Typography>含有所要SKU的膠箱: {nonZero}</Typography>
    </Stack>
  );
}