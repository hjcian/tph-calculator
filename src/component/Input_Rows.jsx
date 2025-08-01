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
  storage = [],
  all_storage = [],
  port = [],
}) {

  const typeLabels = {
    storage: '儲存',
    port: '工作站',
    picking: '揀貨',
  };

  const listNames = {
    storage: 'storage',
    port: 'port',
    picking: 'picking list',
  };

  const typeLabel = typeLabels[type] || '揀貨';
  const listName = listNames[type] || 'picking list';

  const handleAdd = () => {
    const x = parseFloat(newRow.x);
    const y = parseFloat(newRow.y);
    const z = parseFloat(newRow.z);


    const isDuplicate = list.some(
      (item) => item.x === x && item.y === y && item.z === z
    );

    if (isDuplicate) {
      if (type == 'port') {
        alert(`工作站口 (${x}, ${y}, ${z})已存在\nThe port (${x}, ${y}, ${z}) already exists`);
      } else if (type == 'robot') {
        alert(`機器人已在 (${x}, ${y}, ${z})\n Robot is already at (${x}, ${y}, ${z}).`);
      } else {
        alert(`容器 (${x}, ${y}, ${z}) 已存在於${typeLabel}中\nThe container (${x}, ${y}, ${z}) already exists in the ${listName}.`);
      }
      return;
    }

    if (type == 'picking' || type == 'storage') {
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && (x <= length && y !== 0) && (y <= breadth && x != 0) && z <= height && z > 0) {
        if (type === 'picking') {
          const isExist = storage.some(
            (item) =>
              item.x === x &&
              item.y === y &&
              item.z === z
          );
          if (!isExist) {
            alert(`容器(${x}, ${y}, ${z})不在庫存\nThe container (${x}, ${y}, ${z})is not in storage`);
            return;
          }
        }
        if (type === 'storage') {
          if (storage.length + 1 > length * breadth * height * 0.9) {
            alert(`庫存已達上限的 90%，請先清空部分空間再新增容器\nStorage space is 90% full. Please free up space before adding new containers.`)
            return;
          }
        }

        setList((prev) => [...prev, { x, y, z }]);
        setNewRow({ x: '', y: '', z: '' }); // Reset input after adding

      } else {
        alert(`請輸入有效的 (x, y, z) 位置\nPlease enter a valid (x, y, z) location within bounds.`);
      }
    } else if (type == 'port') {
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && ((x >= 0 && x <= length && y == 0) || (y >= 0 && y <= breadth && x == 0)) && z == 0 && !(x == 0 && y == 0)) {
        setList((prev) => [...prev, { x, y, z }]);
      }
      else {
        alert(`請輸入有效的 (x, y, z) 位置\nPlease enter a valid (x, y, z) location within bounds.`);
      }
    } else if (type === 'robot') {
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && x >= 0 && x < length && y >= 0 && z >= 0) {

        const seen = new Set(storage.map(item => `${item.x},${item.y}`));

        const groupedAll = {};
        all_storage.forEach(({ x, y, z }) => {
          const key = `${x},${y}`;
          if (!groupedAll[key] || z > groupedAll[key].z) {
            groupedAll[key] = { x, y, z }; // highest z
          }
        });

        const augmentedStorage = [...storage];

        Object.entries(groupedAll).forEach(([key, coord]) => {
          if (!seen.has(key)) {
            augmentedStorage.push(coord);
          }
        });

        const lowestZMap = {};
        augmentedStorage.forEach(item => {
          const key = `${item.x},${item.y}`;
          if (!(key in lowestZMap) || item.z < lowestZMap[key]) {
            lowestZMap[key] = item.z;
          }
        });

        const lowestStorage = Object.entries(lowestZMap).flatMap(([key, z]) => {
          const [x, y] = key.split(',').map(Number);
          return Array.from({ length: z + 1 }, (_, i) => ({ x, y, z: z - i }));
        });

        const currentports = port;
        const portsWithZPlusOne = port.map(({ x, y, z }) => ({
          x, y, z: z + 1
        }));

        const combinedPositions = [
          ...currentports,
          ...portsWithZPlusOne,
          ...lowestStorage
        ];

        if (combinedPositions.length === 0) {
          alert('No valid positions available.');
          return;
        }

        const inAvailable = combinedPositions.some(item => item.x === x && item.y === y && item.z === z);

        if (inAvailable) {
          setList([{ x, y, z }]);
        } else {
          alert(`位置必須在工作站，或是在容器下方無阻擋的位置。\nThe position must be at a port or at a place with no container blocking underneath.`);
        }
      } else {
        alert(`請輸入有效的 (x, y, z) 位置\nPlease enter a valid (x, y, z) location within bounds.`);
      }
    }
  };

  const randomPosition = () => {

    const seen = new Set(storage.map(item => `${item.x},${item.y}`));

    const groupedAll = {};
    all_storage.forEach(({ x, y, z }) => {
      const key = `${x},${y}`;
      if (!groupedAll[key] || z > groupedAll[key].z) {
        groupedAll[key] = { x, y, z }; // highest z
      }
    });

    const augmentedStorage = [...storage];

    Object.entries(groupedAll).forEach(([key, coord]) => {
      if (!seen.has(key)) {
        augmentedStorage.push(coord);
      }
    });

    const lowestZMap = {};
    augmentedStorage.forEach(item => {
      const key = `${item.x},${item.y}`;
      if (!(key in lowestZMap) || item.z < lowestZMap[key]) {
        lowestZMap[key] = item.z;
      }
    });

    const lowestStorage = Object.entries(lowestZMap).flatMap(([key, z]) => {
      const [x, y] = key.split(',').map(Number);
      return Array.from({ length: z + 1 }, (_, i) => ({ x, y, z: z - i }));
    });

    const currentports = port;
    const portsWithZPlusOne = port.map(({ x, y, z }) => ({
      x, y, z: z + 1
    }));

    const combinedPositions = [
      ...currentports,
      ...portsWithZPlusOne,
      ...lowestStorage
    ];

    if (combinedPositions.length === 0) {
      alert('No valid positions available.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * combinedPositions.length);
    const chosenPosition = combinedPositions[randomIndex];

    console.log("choose",chosenPosition);
    setList([chosenPosition]);
    setNewRow(chosenPosition);
  }

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
                value={newRow[axis] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || Number.isInteger(Number(value))) {
                    setNewRow((prev) => ({
                      ...prev,
                      [axis]: e.target.value,
                    }))
                  };
                }}
              />
            </Grid>
          ))}

          <Button
            variant="contained"
            disableElevation
            sx={{ height: '56px', minWidth: '56px' }}
            onClick={handleAdd}
          >
            {type != 'robot' ? <AddIcon /> : 'SET'}
          </Button>
          {type == "robot" && <Button
            variant="contained"
            disableElevation
            sx={{ height: '56px', minWidth: '56px', backgroundColor: '' }}
            onClick={randomPosition}>
            Random
          </Button>}
        </Stack>
      )}
    </>
  );
}
