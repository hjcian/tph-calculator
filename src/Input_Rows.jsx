import { Stack, Grid, Typography, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
  storage = []
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
      if (type === 'picking') {
        const isExist = storage.some(
          (item) =>
            item.x === x &&
            item.y === y &&
            item.z === z
        );
        if (!isExist) {
          alert(`容器(${x}, ${y}, ${z})不在庫存\nThe container (${x}, ${y}, ${z})is not in storage`);
          setNewRow({ x: '', y: '', z: '' });
          return;
        }
      }
        if (type === 'storage') {
          console.log(length*breadth*height);
          if(storage.length +1 > length*breadth*height * 0.9){
            alert(`庫存已達上限的 90%，請先清空部分空間再新增容器\nStorage space is 90% full. Please free up space before adding new containers.`)
            setNewRow({ x: '', y: '', z: '' });
            return;
          }
        }

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
            <AddIcon/>
          </Button>
        </Stack>
      )}
    </>
  );
}
