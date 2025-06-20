import { useState, useRef } from 'react'
import './App.css'
import { TextField, Paper, Grid, Button, Stack, Divider, Typography, Switch, FormControlLabel, IconButton } from '@mui/material';
import { calculate_time, display_result } from './Calculate_time.jsx';
import { v4 as uuidv4 } from 'uuid';
import CustomizedDialogs from './Dialog.jsx';

function App() {
  const [result, setResult] = useState(null);
  const [checked_all, setChecked_all] = useState(false);
  const [checked_random, setChecked_random] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [rows, setRows] = useState([{ id: uuidv4(), x: '', y: '', z: '' }]);
  const rowCount = rows.length;
  const resultRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    length: '',
    breadth: '',
    height: '',
    trf_t: '',
    climb_t: '',
    turn_t: '',
    work_t: '',
  });

  const handleDimensionChange = (field, value) => {
    const numVal = Number(value);
    const isDimension = ['length', 'breadth', 'height'].includes(field);

    // Update value
    if (field === 'length') setLength(numVal);
    else if (field === 'breadth') setBreadth(numVal);
    else if (field === 'height') setHeight(numVal);
    else if (field === 'trf_t') setTrf_t(numVal);
    else if (field === 'climb_t') setClimb_t(numVal);
    else if (field === 'turn_t') setTurn_t(numVal);
    else if (field === 'work_t') setWork_t(numVal);

    let error = '';
    if (value === '') {
      error = '必填';
    } else if (numVal < 1) {
      error = '必須輸入 ≥ 1';
    } else if (isDimension && !Number.isInteger(numVal)) {
      error = '必須是整數';
    }

    // Validate
    setFieldErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  ///

  const [length, setLength] = useState(10);
  const [breadth, setBreadth] = useState(10);
  const [height, setHeight] = useState(10);

  const [trf_t, setTrf_t] = useState(2);
  const [climb_t, setClimb_t] = useState(2);
  const [turn_t, setTurn_t] = useState(3.5);
  const [work_t, setWork_t] = useState(30);

  var error = false;

  const handleInputChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };


  const handle_calculate_all = (event) => {
    //const isChecked = event.target.checked;
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

  const handle_random_calculate = (event) => {
    if (checked_random == false) {
      setChecked_random(true);
    } else {
      setChecked_random(false);
    }
  };

  const addRow = (index) => {
    const newRow = { id: uuidv4(), x: '', y: '', z: '' };
    setRows((prevRows) => [
      ...prevRows.slice(0, index + 1),
      newRow,
      ...prevRows.slice(index + 1),
    ]);
  };

  const removeRow = (idToRemove) => {
    setRows(rows.filter((row) => row.id !== idToRemove));
  };


  function calculate(formData) {

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);


    const getRandomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    var x = 0;
    var y = 0;
    var z = 1;
    var time = 0;
    const storage = [];
    var all_time = 0;

    /***********************
     *       Pick All      *
     ***********************/
    if (checked_all && !checked_random) {
      all_time = 0;
      let i = 0;
      const existing = new Set(
        storage.map((item) => `${item.x},${item.y},${item.z}`)
      );


      for (x; x <= length; x++) {
        for (y; y <= breadth; y++) {
          for (z; z <= height; z++) {
            if (i < Math.floor(length * breadth * height * 0.9)) {
              console.log("x,y,z:", x, y, z);
              time = 0;
              del_time = calculate_time(x, y, z, time, trf_t, climb_t, turn_t);
              if (del_time > 0) {
                all_time += del_time;
                i++;
                storage.push({ x, y, z });
              }
            }
          }
          z = 1;
        }
        y = 0;
      }
      console.log("i", i);
      console.log(storage);
      all_time == 0 ? error = true : error = false;
      setResult(display_result(length, breadth, height, all_time, error));
    }

    /***********************`
     * Pick All (Random)    *
     ***********************/
    else if ((checked_all && checked_random)) {
      all_time = 0;
      const existing = new Set(
        storage.map((item) => `${item.x},${item.y},${item.z}`)
      );

      let i = 0;
      let attempts = 0;
      var del_time = 0;
      const maxAttempts = length * breadth * height * 5;

      while (i < Math.floor(length * breadth * height * 0.9) && attempts < maxAttempts) {
        attempts++;

        x = getRandomInt(0, length);
        y = getRandomInt(0, breadth);
        z = getRandomInt(0, height);
        const key = `${x},${y},${z}`;

        if (!existing.has(key)) {
          time = 0;
          storage.push({ x, y, z });
          existing.add(key);
          del_time = calculate_time(x, y, z, time, trf_t, climb_t, turn_t);

          if (del_time > 0) {
            all_time += del_time;
            i++;
          }
        }
      }
      console.log("i", i);
      console.log(storage);
      all_time == 0 ? error = true : error = false;
      setResult(display_result(length, breadth, height, all_time, error));
    }

    /***********************
     *    Pick Selected    *
     ***********************/
    else if ((!checked_all && !checked_random) && ((formData.get("x")) != '' && formData.get("y") != '' && formData.get("z") != '')) {
      all_time = 0;

      for (let i = 0; i < rowCount; i++) {
        const xVal = formData.get(`x-${i}`);
        const yVal = formData.get(`y-${i}`);
        const zVal = formData.get(`z-${i}`);

        if (xVal !== '' && yVal !== '' && zVal !== '') {
          x = Number(xVal);
          y = Number(yVal);
          z = Number(zVal);
          console.log("x,y,z:", x, y, z);
          all_time += calculate_time(x, y, z, time, trf_t, climb_t, turn_t);
        }
      }
      all_time == 0 ? error = true : error = false;
      setResult(display_result(length, breadth, height, all_time, error));
    } else {
      setResult(<Paper elevation={0} style={{ alignContent: "center", backgroundColor: "pink", width: '100%', minWidth: 300, minHeight: 250 }}>請輸入相關資料</Paper>);
    }
  }
  return (
    <form action={calculate} >
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
              <Typography variant="h5" fontWeight={"bold"} marginBottom={-2}>Setting 設置</Typography>
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
            >
              <Typography
                sx={{ textAlign: 'left' }}
                variant="h5"
                fontWeight="bold"
                marginBottom={-2}
              >
                Container Location 容器位置
              </Typography>
              <FormControlLabel
                control={<Switch checked={checked_all} onClick={handle_calculate_all} />}
                label="Pick All 全選"
              />
              <FormControlLabel
                control={<Switch disabled={disabled} checked={checked_all ? checked_random : false} onClick={handle_random_calculate} />}
                label="Random Picking 隨機挑選"
              />
            </Stack>
            <>
              {!checked_all && rows.map((row, index) => (
                <Grid borderRadius={2}
                  backgroundColor="#FAFAFA"
                  padding={2}
                  width={"100%"}
                  key={index}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={2}
                    width="100%"
                    justifyContent="space-between"
                  >
                    <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Typography>x:</Typography>
                      <TextField
                        name={`x-${index}`}
                        type="number"
                        fullWidth
                        value={row.x ?? ''}
                        onChange={(e) => handleInputChange(row.id, 'x', e.target.value)}
                      />
                    </Grid>
                    <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Typography>y:</Typography>
                      <TextField
                        name={`y-${index}`}
                        type="number"
                        fullWidth
                        value={row.y ?? ''}
                        onChange={(e) => handleInputChange(row.id, 'y', e.target.value)}
                      />
                    </Grid>
                    <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Typography>z:</Typography>
                      <TextField
                        name={`z-${index}`}
                        type="number"
                        fullWidth
                        value={row.z ?? ''}
                        onChange={(e) => handleInputChange(row.id, 'z', e.target.value)}
                      />
                    </Grid>
                    <Grid sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() => addRow(index)}
                        sx={{ height: '56px', minWidth: '56px' }}
                      >
                        +
                      </Button>
                    </Grid>
                    <Grid sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() => removeRow(row.id)}
                        sx={{ height: '56px', minWidth: '56px', backgroundColor: 'red' }}
                        disabled={rows.length === 1}
                      >
                        -
                      </Button>
                    </Grid>
                  </Stack>
                </Grid>
              ))}
            </>
          </Grid>
          <Button type="submit" variant="contained" disableElevation sx={{ backgroundColor: "#dd5716", display: "flex", width: "100%", marginTop: '10px' }}>計算</Button>
        </Paper>
        {result !== "" ? (result != null &&
          <Paper elevation={0} ref={resultRef} style={{
            backgroundColor: "lightgreen", borderColor: "#fcfdfb",
            borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
          }}
          >
            {result}
          </Paper>
        ) : <Paper elevation={0} ref={resultRef} style={{
          backgroundColor: "pink", borderColor: "#fcfdfb",
          borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
        }}
        >Error</Paper>}
      </Stack>
    </form>
  );
}

export default App
