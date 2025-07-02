import { useState, useRef, useMemo, useEffect } from 'react'
import './App.css'
import { TextField, Paper, Grid, Button, Stack, Divider, Typography, Alert, Snackbar } from '@mui/material';
import { calculate_time, display_result, random_storage } from './Calculate_time.jsx';
import CustomizedDialogs from './Dialog.jsx';
import InputRowsSection from './Input_Rows.jsx';
import StorageTable from './table.jsx';
import StorageScene from './3d.jsx';
import DeleteIcon from '@mui/icons-material/Delete';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import EngineeringIcon from '@mui/icons-material/Engineering';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SmartToySharpIcon from '@mui/icons-material/SmartToySharp';

function App() {
  const [result, setResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  //const [storage, setStorage] = useState([]);
  const resultRef = useRef(null);
  const container_LocationRef = useRef(null);
  const pickingListRef = useRef(null);
  const [storageRows, setStorageRows] = useState([{ x: '', y: '', z: '' }]);
  const [pickingRows, setPickingRows] = useState([{ x: '', y: '', z: '' }]);
  const all_storage = [];
  const [pickingList, setPickingList] = useState([]);
  const [length, setLength] = useState(5);
  const [breadth, setBreadth] = useState(5);
  const [height, setHeight] = useState(5);
  const [storage, setStorage] = useState([]);

  ///
  const [trf_t, setTrf_t] = useState(2);
  const [climb_t, setClimb_t] = useState(2);
  const [turn_t, setTurn_t] = useState(3.5);
  const [work_t, setWork_t] = useState(30);

  let totalTime = 0;
  let totalRelocate = 0;

  const [fieldErrors, setFieldErrors] = useState({
    length: '',
    breadth: '',
    height: '',
    trf_t: '',
    climb_t: '',
    turn_t: '',
    work_t: '',
  });

  useEffect(() => {
    setPickingList([]);
    if (pickingList.length !== 0) {
      alert("Changes has been made in storage. Picking list has been deleted.");
    }
  }, [storage]);

  const handleDelete = (indexToDelete) => {
    setStorage((prev) =>
      prev.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleDeleteList = (indexToDelete) => {
    setPickingList((prev) =>
      prev.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleDimensionChange = (field, value) => {
    const numVal = Number(value);

    // Update value
    if (field === 'length') setLength(numVal);
    else if (field === 'breadth') setBreadth(numVal);
    else if (field === 'height') setHeight(numVal);
    else if (field === 'trf_t') setTrf_t(numVal);
    else if (field === 'climb_t') setClimb_t(numVal);
    else if (field === 'turn_t') setTurn_t(numVal);
    else if (field === 'work_t') setWork_t(numVal);
  };

  const validateInputs = () => {
    const newErrors = {};

    const fields = {
      length,
      breadth,
      height,
      trf_t,
      climb_t,
      turn_t,
      work_t,
    };

    for (const [key, value] of Object.entries(fields)) {
      const isDimension = ['length', 'breadth', 'height'].includes(key);
      if (value === '' || isNaN(value)) {
        newErrors[key] = '必填';
      } else if (value < 1) {
        newErrors[key] = '必須輸入 ≥ 1';
      } else if (isDimension && !Number.isInteger(value)) {
        newErrors[key] = '必須是整數';
      }
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0; // valid if no errors
  };

  const handleFinalSubmit = async () => {
    let n = 1;
    let ninetystorage = Math.floor(length * breadth * height * 0.9);
    if (validateInputs()) {
      // proceed with computation
      console.log("All valid, proceeding...");
      for (let p = 0; p < n; p++) {
        console.log(`%c[DEBUG] %cIT RAN HERE ${p} times`, 'color: gray;', 'color: red; font-weight: bold;');
        //newStorage = random_storage(length, breadth, height);
        const [Time, RelocateTime] = calculate(storage);
        //setStorage(newStorage);
        if (p % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0)); // let the UI update
        }
        totalTime += Time;
        totalRelocate += RelocateTime;
      }
    } else {
      console.log("Errors found.");
    }
    console.log(totalTime, totalRelocate);
    let avgTime = totalTime / n / ninetystorage;
    let avgRelocate = totalRelocate / n / ninetystorage;
    console.log("average time spent outbound:", avgTime);
    console.log("average time spent relocating:", avgRelocate);
  };

  for (let x = 0; x < length; x++) {
    for (let y = 1; y <= breadth; y++) {
      for (let z = 1; z <= height; z++) {
        all_storage.push({ x, y, z });
      }
    }
  }

  const handle_calculate_all = () => {
    setPickingList(storage);
  };

  const handle_random_calculate = () => {
    let shuffledList = [...pickingList];
    let i;
    for (i = shuffledList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
    }
    setPickingList(shuffledList);
  };

  const handle_generate_random_storage = () => {
    let newStorage = random_storage(length, breadth, height);
    newStorage = [...newStorage].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      if (a.y !== b.y) return a.y - b.y;
      return a.z - b.z;
    });
    setStorage(newStorage);
  };

  const handle_delete_all = () => {
    setStorage([]);
    console.log("Deleted Storage", storage);
    // console.log("storage gen", newStorage);
  };

  const handle_delete_all_list = () => {
    setPickingList([]);
    console.log("Deleted Storage", storage);
    // console.log("storage gen", newStorage);
  };

  function calculate(calculate_storage = []) {
    let time = 0;
    let relocate_time = 0;
    let i = 0;
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    if (storage.length == 0) {
      setTimeout(() => {
        container_LocationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);

      setSnackbarMessage("No Storage 無庫存");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    if (pickingList.length == 0) {
      setTimeout(() => {
        pickingListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);

      setSnackbarMessage("No Picking List 無揀貨單");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    let newStorage = calculate_storage;

    while (i < pickingList.length) {
      const containers = pickingList[i];
      const [newestStorage, deltaTime, deltaRelocate] = calculate_time(containers.x, containers.y, containers.z, trf_t, climb_t, turn_t, all_storage, newStorage);
      time += deltaTime;
      relocate_time += deltaRelocate;
      newStorage = newestStorage;
      i++;
    }
    if (pickingList.length > 0) {
      setResult(
        <Paper elevation={0} ref={resultRef} style={{
          backgroundColor: "lightgreen", borderColor: "#fcfdfb",
          borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
        }}
        >
          {display_result(length, breadth, height, time + relocate_time, false, storage)}
        </Paper>
      )
    }
    return ([time, relocate_time]);
  }

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Stack
        gap={1}
        maxWidth={1500}
        width="100%"
        minWidth={400}
        direction="column"
        alignItems="stretch"
        sx={{
          transform: 'scale(0.9)',
          transformOrigin: 'center',
        }}
      >
        <Paper elevation={0} style={{
          backgroundColor: "white", borderColor: "#fcfdfb",
          borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
        }}>
          <Grid display={'flex'} gap={2} flexDirection={'column'} alignItems="flex-start">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%">
              <Typography variant="h5" fontWeight={"bold"} marginBottom={-2}> <WarehouseIcon /> Storage Setting 庫存設置</Typography>
              <CustomizedDialogs />
            </Stack>
            <Grid borderRadius={2} display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'} backgroundColor={"#FAFAFA"} padding={2}>
              Length 长度 (unit): <TextField
                value={length}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                error={!!fieldErrors.length}
                label={fieldErrors.length}
                type="number"
                name="length"
                sx={{ flex: 1, width: "100px" }} />

              Breadth 宽度 (unit):
              <TextField
                value={breadth}
                onChange={(e) => handleDimensionChange('breadth', e.target.value)}
                error={!!fieldErrors.breadth}
                label={fieldErrors.breadth}
                type="number"
                name="breadth"
                sx={{ flex: 1, width: "100px" }} />

              Height 高度 (unit): <TextField
                value={height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                error={!!fieldErrors.height}
                label={fieldErrors.height}
                type="number"
                name="height"
                sx={{ flex: 1, width: "100px" }} />
            </Grid>
            <Divider orientation="horizontal" flexItem />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              marginBottom={-1}
            >
              <Typography variant="h5" fontWeight={"bold"}><EngineeringIcon /> Workstation Setting 工作站設置</Typography>
              <Stack direction="row" alignItems="center">
                <Typography marginRight={1}>No.of Workstation(s):</Typography>
                <TextField disabled defaultValue={1}></TextField>
              </Stack>
            </Stack>
            <Divider orientation="horizontal" flexItem />
            <Stack direction="column" marginBottom={-1} gap={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"

              >
                <Typography variant="h5" fontWeight={"bold"}><SmartToySharpIcon /> AGV Setting 機器人設置</Typography>
                <Stack direction="row" alignItems="center">
                  <Typography marginRight={1}>No.of AGV(s):</Typography>
                  <TextField disabled defaultValue={1}></TextField>
                </Stack>
              </Stack>
              <Grid borderRadius={2} display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'} backgroundColor={"#FAFAFA"} padding={2}>
                移動速度 (m/s): <TextField
                  name="move"
                  disabled={true}
                  sx={{ flex: 1, width: "150px" }}
                />
                轉向時間 (s): <TextField
                  value={trf_t}
                  onChange={(e) => handleDimensionChange('trf_t', e.target.value)}
                  error={!!fieldErrors.trf_t}
                  label={fieldErrors.trf_t}
                  name="trf_t"
                  type='number'
                  sx={{ flex: 1, width: "150px" }} />
                爬升時間 (s): <TextField
                  value={climb_t}
                  onChange={(e) => handleDimensionChange('climb_t', e.target.value)}
                  error={!!fieldErrors.climb_t}
                  label={fieldErrors.climb_t}
                  name="climb_t"
                  sx={{ flex: 1, width: "150px" }} />
                {/*Pick/drop ==> slide up + rotate + slide down*/}
                Pick/Drop 時間 (s): <TextField
                  value={turn_t}
                  onChange={(e) => handleDimensionChange('turn_t', e.target.value)}
                  error={!!fieldErrors.turn_t}
                  label={fieldErrors.turn_t}
                  name="turn_t"
                  sx={{ flex: 1, width: "150px" }} />
                作業時間 (s): <TextField value={work_t}
                  onChange={(e) => setWork_t(Number(e.target.value))} name="work" sx={{ flex: 1, width: "150px" }} />
              </Grid>
            </Stack>
            <Divider orientation="horizontal" flexItem />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              marginBottom={-1}
              ref={container_LocationRef}
            >
              <Typography variant="h5" fontWeight={"bold"}><InventoryIcon /> Container Location 膠箱位置</Typography>
              <Stack direction={"row"} gap={1}>
                <Button type="button" variant="contained" disableElevation disabled={storage.length == 0} onClick={handle_delete_all} sx={{ backgroundColor: "red", width: "10" }}> <DeleteIcon />Clear All</Button>
                <Button type="button" variant="contained" disableElevation onClick={handle_generate_random_storage} sx={{ backgroundColor: "#dd5716", width: "10" }}>Generate Storage 建立庫存 （90% Full）</Button>
              </Stack>
            </Stack>
            {storage.length > 0 && <StorageTable storage={storage} onDelete={handleDelete} />}

            <InputRowsSection
              type="storage"
              newRow={storageRows}
              setNewRow={setStorageRows}
              list={storage}
              setList={setStorage}
              length={length}
              breadth={breadth}
              height={height}
              storage={storage}
            />

            {length > 0 && breadth > 0 && height > 0 && <StorageScene storage={storage} all_storage={all_storage} />}
            <Divider orientation="horizontal" flexItem />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              marginBottom={-1}
              ref={pickingListRef}
            >
              <Typography
                sx={{ textAlign: 'left' }}
                variant="h5"
                fontWeight="bold"
              >
                <ListAltIcon /> Picking List 揀貨單
              </Typography>
              <Stack direction={"row"} gap={2}>
                <Button type="button" variant="contained" disabled={pickingList.length == 0} disableElevation onClick={handle_delete_all_list} sx={{ backgroundColor: "red", width: "10" }}><DeleteIcon /> Clear All</Button>
                <Button type="button" variant="contained" disabled={storage.length == 0} disableElevation onClick={handle_calculate_all} sx={{ backgroundColor: "orange", width: "10" }}>Pick All 全選 (Best Case)</Button>
                {pickingList.length > 1 && <Button type="button" variant="contained" onClick={handle_random_calculate} disableElevation>Random Shuffle Picking List</Button>}
              </Stack>
            </Stack>

            {pickingList.length > 0 && <StorageTable storage={pickingList} onDelete={handleDeleteList} />}

            <InputRowsSection
              type="picking"
              newRow={pickingRows}
              setNewRow={setPickingRows}
              list={pickingList}
              setList={setPickingList}
              length={length}
              breadth={breadth}
              height={height}
              storage={storage}
            />

          </Grid>
          <Button onClick={handleFinalSubmit} variant="contained" disableElevation sx={{ backgroundColor: "#dd5716", display: "flex", width: "100%", marginTop: '30px' }}>計算時間</Button>
        </Paper>
        {result}
      </Stack>

    </>
  );
}


export default App
