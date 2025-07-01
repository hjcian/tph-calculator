import { Stack, Grid, Typography, TextField, Button } from '@mui/material';

export default function InputRowsSection({
  newRow,
  setNewRow,
  list,
  setList,
  showRows = true,
  length,
  breadth,
  height,
  type = 'storage',
}) {

  const typeLabel = type === 'storage' ? '儲存' : '揀貨';
  const listName = type === 'storage' ? 'storage' : 'picking list';

  const handleAdd = () => {
    const x = parseFloat(newRow.x);
    const y = parseFloat(newRow.y);
    const z = parseFloat(newRow.z);

    const isDuplicate = list.some(
      (item) => item.x === x && item.y === y && item.z === z
    );

    if (isDuplicate) {
      alert(`容器 (${x}, ${y}, ${z}) 已存在於${typeLabel}中\nThe container (${x}, ${y}, ${z}) already exists in the ${listName}.`);
      return;
    }

    if (!isNaN(x) && !isNaN(y) && !isNaN(z) &&
      x <= length && y <= breadth && z <= height && z > 0) {
      setList((prev) => [...prev, { x, y, z }]);
      setNewRow({ x: '', y: '', z: '' }); // Reset input after adding
    } else {
      alert(`請輸入有效的 (x, y, z) 位置\nPlease enter a valid (x, y, z) location within bounds.`);
    }
  };
  return (
    <>
      {showRows && (
        <Stack direction="row" alignItems="center" gap={2} width="100%" justifyContent="space-between">
          {['x', 'y', 'z'].map((axis) => (
            <Grid key={axis} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography>{axis}:</Typography>
              <TextField
                name={axis}
                type="number"
                fullWidth
                value={newRow[axis]}
                onChange={(e) =>
                  setNewRow((prev) => ({
                    ...prev,
                    [axis]: e.target.value,
                  }))
                }
              />
            </Grid>
          ))}

          <Button
            variant="contained"
            disableElevation
            sx={{ height: '56px', minWidth: '56px' }}
            onClick={handleAdd}
          >
            +
          </Button>
        </Stack>
      )}
    </>
  );
}
