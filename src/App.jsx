import { useState, useRef, useMemo, useEffect } from 'react'
import './App.css'
import { TextField, Paper, Grid, Button, Stack, Divider, Typography, Switch, FormControlLabel } from '@mui/material';
import { calculate_time, display_result, random_storage } from './Calculate_time.jsx';
import { v4 as uuidv4 } from 'uuid';
import CustomizedDialogs from './Dialog.jsx';
import InputRowsSection from './Input_Rows.jsx';
import StorageTable from './table.jsx';
import StorageScene from './3d.jsx';

function App() {
  const [result, setResult] = useState(null);
  const [checked_all, setChecked_all] = useState(false);
  const [checked_random, setChecked_random] = useState(false);
  const [checked_random_storing, setChecked_random_storing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  //const [storage, setStorage] = useState([]);
  const resultRef = useRef(null);
  const [storageRows, setStorageRows] = useState([{ x: '', y: '', z: '' }]);
  const [pickingRows, setPickingRows] = useState([{ x: '', y: '', z: '' }]);
  const all_storage = [];
  const [pickingList, setPickingList] = useState([]);
  const [time_moving, setTimeMoving] = useState(0);
  const [time_relocate, setTimeRelocate] = useState(0);
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
  var error = false;


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
    if (checked_all && !checked_random) {
      let sortedList = [...storage].sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.y !== b.y) return a.y - b.y;
        return a.z - b.z;
      });
      setPickingList(sortedList);
    } if (checked_all && checked_random) {
      let shuffledList = [...storage];
      let i;
      for (i = shuffledList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
      }
      setPickingList(shuffledList);
    }
  }, [checked_all, checked_random, storage]);

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
    let newStorage;
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

  // const handleInputChange = (id, field, value) => {
  //   setRows((prevRows) =>
  //     prevRows.map((row) =>
  //       row.id === id ? { ...row, [field]: value } : row
  //     )
  //   );
  // };


  const handle_calculate_all = (event) => {
    if (checked_all == false) {
      setChecked_all(true);
      setDisabled(false);
      setChecked_random(false);
    } else {
      setChecked_all(false);
      setDisabled(true);
      setChecked_random(false);
    }
  };

  const handle_random_calculate = () => {
    if (checked_random == false) {
      setChecked_random(true);
    } else {
      setChecked_random(false);
    }
  };

  const handle_generate_random_storage = () => {
    const newStorage = random_storage(length, breadth, height);
    setStorage(newStorage);
    // console.log("storage gen", newStorage);
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

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    console.log("filled storage:", calculate_storage);

    var x = 0;
    var y = 0;
    var z = 1;
    var all_time = 0;


    console.log("all available storage:", all_storage);

    /***********************
     *       Pick All      *
     ***********************/
    if (checked_all && !checked_random) {
      all_time = 0;
      let i = 0;

      let sorted_storage = calculate_storage.sort((a, b) => {
        if (a.x !== b.x) {
          return a.x - b.x;
        } else {
          return a.y - b.y;
        }
      });

      console.log("sorted:", sorted_storage);

      time = 0;
      relocate_time = 0;

      i = 0;
      while (i < sorted_storage.length) {
        const containers = sorted_storage[i];
        const [newestStorage, deltaTime, deltaRelocate] = calculate_time(containers.x, containers.y, containers.z, trf_t, climb_t, turn_t, all_storage, sorted_storage);
        time += deltaTime;
        relocate_time += deltaRelocate;
        sorted_storage = newestStorage;
        //console.log("newest storage", sorted_storage);
        i++;
      }

      //setTimeMoving(prevTime => prevTime + time);

      //setTimeRelocate(prevTime => prevTime + relocate_time);
      console.log("outbound1:", time);
      console.log("relocated2:", relocate_time);
      setResult(display_result(length, breadth, height, time + relocate_time, error, sorted_storage));
      console.log("accurate time:", time + relocate_time);
      //console.log("outbound:", time_moving);
      //console.log("relocated:", time_relocate);

      // for (x; x <= length; x++) {
      //   for (y; y <= breadth; y++) {
      //     for (z; z <= height; z++) {
      //       if (i < Math.floor(length * breadth * height * 0.9)) {
      //         console.log("x,y,z:", x, y, z);
      //         time = 0;
      //         del_time = calculate_time(x, y, z, time, trf_t, climb_t, turn_t, all_storage);
      //         if (del_time > 0) {
      //           all_time += del_time;
      //           i++;
      //           picks.push({ x, y, z });
      //         }
      //       }
      //     }
      //     z = 1;
      //   }
      //   y = 0;
      // }

      time == 0 ? error = true : error = false;

      //setResult(display_result(length, breadth, height, time, error));
    }

    /***********************`
     * Pick All (Random)    *
     ***********************/

    else if ((checked_all && checked_random)) {
      all_time = 0;

      var del_time = 0;
      // const total_bins = length * breadth * height;
      // const target_fill = Math.floor(total_bins * 0.9);
      // let filled_bins = 0;
      // let attempts = 0;
      // const maxAttempts_bins = total_bins * 5;

      // const columnMap = new Map(); // key = "x,y", value = next z to fill (top-down)

      // while (filled_bins < target_fill && attempts < maxAttempts_bins) {
      //   const x = getRandomInt(0, length - 1);
      //   const y = getRandomInt(1, breadth);
      //   const key = `${x},${y}`;

      //   // Get current top z level for this column (starts at height)
      //   let currentZ = columnMap.has(key) ? columnMap.get(key) : height;

      //   // If column is already full (z < 1), skip
      //   if (currentZ < 1) {
      //     attempts++;
      //     continue;
      //   }

      //   // Decide how many bins to stack this time (1 to currentZ + 1)
      //   const maxCanAdd = currentZ + 1;
      //   const remaining = target_fill - filled_bins;
      //   const binsToAdd = Math.min(getRandomInt(1, maxCanAdd + 1), remaining);

      //   for (let i = 0; i < binsToAdd && currentZ > 0; i++) {
      //     storage.push({ x, y, z: currentZ });
      //     currentZ--;
      //     filled_bins++;
      //   }

      //   columnMap.set(key, currentZ); // update next z position for this column
      //   attempts++;
      // }

      //const maxAttempts = length * breadth * height * 5;

      let i = 0;
      let shuffledStorage = [...calculate_storage];

      for (i = shuffledStorage.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledStorage[i], shuffledStorage[j]] = [shuffledStorage[j], shuffledStorage[i]];
      }
      console.log("shuffled_storage:", shuffledStorage);

      for (let i = 0; i < shuffledStorage.length; i++) {
        const randomBin = shuffledStorage[i];
        const { x, y, z } = randomBin;
        const [newestStorage, deltaTime, deltaRelocate] = calculate_time(x, y, z, trf_t, climb_t, turn_t, all_storage, shuffledStorage);
        time += deltaTime;
        relocate_time += deltaRelocate;
        shuffledStorage = newestStorage;
        console.log("ALL TIME:", time);
      }

      // while (i < Math.floor(length * breadth * height * 0.9) && attempts < maxAttempts) {
      //   attempts++;

      //   x = getRandomInt(0, length);
      //   y = getRandomInt(0, breadth);
      //   z = getRandomInt(0, height);
      //   const key = `${x},${y},${z}`;

      //   if (!existing.has(key)) {
      //     time = 0;
      //     picks.push({ x, y, z });
      //     existing.add(key);
      //     del_time = calculate_time(x, y, z, time, trf_t, climb_t, turn_t);

      //     if (del_time > 0) {
      //       all_time += del_time;
      //       i++;
      //     }
      //   }
      // }
      // console.log("i", i);
      // console.log(picks);
      all_time == 0 ? error = true : error = false;
      setResult(display_result(length, breadth, height, all_time, error, shuffledStorage));
    }

    /***********************
     *    Pick Selected    *
     ***********************/
    else if (!checked_all && !checked_random) {
      console.log(pickingList);
      // all_time = 0;
      // for (let i = 0; i < pickingRows.length; i++) {
      //   const row = pickingRows[i];
      //   const xVal = row.x;
      //   const yVal = row.y;
      //   const zVal = row.z;

      //   if (xVal !== '' && yVal !== '' && zVal !== '') {
      //     x = Number(xVal);
      //     y = Number(yVal);
      //     z = Number(zVal);
      //     console.log("x,y,z:", x, y, z);
      //     del_time = calculate_time(x, y, z, trf_t, climb_t, turn_t, all_storage, calculate_storage);
      //   }
      //   if (del_time > 0) {
      //     all_time += del_time;
      //   }
      // }
      // all_time == 0 ? error = true : error = false;
      setResult(display_result(length, breadth, height, all_time, error, storage));
    } else {
      setResult(<Paper elevation={0} style={{ alignContent: "center", backgroundColor: "pink", width: '100%', minWidth: 300, minHeight: 250 }}>請輸入相關資料</Paper>);
    }
    return ([time, relocate_time]);
  }

  return (
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
            <Typography variant="h5" fontWeight={"bold"} marginBottom={-2}>Storage Setting 庫存設置</Typography>
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
          <Divider orientation="horizontal" flexItem />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            marginBottom={-1}
          >
            <Typography variant="h5" fontWeight={"bold"}>Workstation Setting 工作站位置</Typography>
            <Stack direction="row" alignItems="center">
              <Typography marginRight={1}>No.of Workstation:</Typography>
              <TextField></TextField>
            </Stack>
          </Stack>
          <Divider orientation="horizontal" flexItem />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            marginBottom={-1}
          >
            <Typography variant="h5" fontWeight={"bold"}>Container Location 膠箱位置</Typography>
            <Stack direction={"row"} gap={1}>
              <Button type="button" variant="contained" disableElevation onClick={handle_delete_all} sx={{ backgroundColor: "red", width: "10" }}>Clear All</Button>
              <Button type="button" variant="contained" disableElevation onClick={handle_generate_random_storage} sx={{ backgroundColor: "#dd5716", width: "10" }}>Generate Storage 建立庫存 （90% Full）</Button>
            </Stack>
          </Stack>
          {<StorageTable storage={storage} onDelete={handleDelete} />}

          <InputRowsSection
            type="storage"
            newRow={storageRows}
            setNewRow={setStorageRows}
            list={storage}
            setList={setStorage}
            length={length}
            breadth={breadth}
            height={height}
          />

          {length > 0 && breadth > 0 && height > 0 && <StorageScene storage={storage} all_storage={all_storage} />}
          <Divider orientation="horizontal" flexItem />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            marginBottom={-1}
          >
            <Typography
              sx={{ textAlign: 'left' }}
              variant="h5"
              fontWeight="bold"
            >
              Picking List 揀貨單
            </Typography>
            <Button type="button" variant="contained" disableElevation onClick={handle_delete_all_list} sx={{ backgroundColor: "red", width: "10" }}>Clear All</Button>
            <FormControlLabel
              control={<Switch checked={checked_all} onClick={handle_calculate_all} />}
              label="Pick All 全選"
            />
            <FormControlLabel
              control={<Switch disabled={disabled} checked={checked_all ? checked_random : false} onClick={handle_random_calculate} />}
              label="Random Picking 隨機挑選"
            />
          </Stack>

          {<StorageTable storage={pickingList} onDelete={handleDeleteList} />}

          {!checked_all && <InputRowsSection
            type="picking"
            newRow={pickingRows}
            setNewRow={setPickingRows}
            list={pickingList}
            setList={setPickingList}
            length={length}
            breadth={breadth}
            height={height}
          />}

          {/* <InputRowsSection
            rows={pickingRows}
            handleInputChange={(id, axis, value) => handleInputChange(id, axis, value, 'picking')}
            addRow={(index) => addRow(index, 'picking')}
            removeRow={(id) => removeRow(id, 'picking')}
            showRows={!checked_all}
          /> */}
        </Grid>
        <Button onClick={handleFinalSubmit} variant="contained" disableElevation sx={{ backgroundColor: "#dd5716", display: "flex", width: "100%", marginTop: '30px' }}>計算時間</Button>
      </Paper>
      {(result != "" && storage.length > 0) ? (result != null &&
        <Paper elevation={0} ref={resultRef} style={{
          backgroundColor: "lightgreen", borderColor: "#fcfdfb",
          borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
        }}
        >
          {result}
        </Paper>
      ) : (<Paper elevation={0} ref={resultRef} style={{
        backgroundColor: "pink", borderColor: "#fcfdfb",
        borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
      }}
      >{storage.length > 0 ? (<Typography>Error</Typography>) : <Typography>No Storage 無庫存</Typography>}</Paper>)}
    </Stack>
  );
}


export default App
