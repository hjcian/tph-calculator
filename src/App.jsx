import { useState } from 'react'
import './App.css'
import { TextField, Paper, Box, Button, Stack, Divider, Typography, Switch, FormControlLabel } from '@mui/material';
import calculate_time from './Calculate_time.jsx';

function App() {
  const [result, setResult] = useState(null);
  const [checked_all, setChecked_all] = useState(false);
  const [checked_random, setChecked_random] = useState(false);
  const [disabled, setDisabled] = useState(true);

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
    //setChecked(event.target.checked);
    if (checked_random == false) {
      setChecked_random(true);
    } else {
      setChecked_random(false);
    }
  };

  function calculate(formData) {
    const length = Number(formData.get("length"));
    const breadth = Number(formData.get("breadth"));
    const height = Number(formData.get("height"));

    //const move_ms = Number(formData.get("move"));
    const trf_t = Number(formData.get("transform"));
    const climb_t = Number(formData.get("climb"));
    const turn_t = Number(formData.get("rotate"));
    console.log(trf_t);

    const getRandomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    var x = 0;
    var y = 0;
    var z = 1;
    var time = 0;
    const storage = [];


    //**************************************
    //            Recursive Method
    //  ************************************/
    // function warehouse(x, y, z) {
    //       console.log("x, y, z =", x, y, z);
    // if (z >= height) return; // finished this z-column
    // if (y >= breadth) {
    //   warehouse(x, 0, z + 1); // move to next z-layer
    //   return;
    // }
    // if (x >= length) {
    //   warehouse(0, y + 1, z); // move to next y-row
    //   return;
    // }

    // Process current (x, y, z)

    // Move to next x-position
    //warehouse(x + 1, y, z);
    //}

    /***********************
     *       Pick All      *
     ***********************/
    if (checked_all && !checked_random) {
      //const total_time_all = warehouse(x, y, z);
      time = 0;
      for (x; x < length; x++) {
        for (y; y < breadth; y++) {
          for (z; z < height; z++) {
            console.log("x,y,z:", x, y, z);
            time = calculate_time(x, y, z, time, trf_t, climb_t, turn_t);
            // if (x > 0 && y > 0) {
            //   if()
            //   time += ((x > 1) ? (x*move_t_long) : move_t_1) + ((y > 1) ? (y*move_t_long) : move_t_1);
            // }
            //console.log("time now:",time);
          }
          z = 1;
        }
        y = 0;
      }
      setResult(<Paper elevation={0} style={{ alignContent: "center", backgroundColor: "lightgreen", width: '100%', minWidth: 300, minHeight: 250 }}>
        倉庫面積：{length * breadth * height} units² <br />
        膠箱數量：{Math.floor((length)*(breadth-1)*(height-1)*0.9)} <br />
        花費時間: {time.toFixed(2)} s <br/>
      </Paper>)
    }

    /***********************
     * Pick All (Random)    *
     ***********************/
    else if ((checked_all && checked_random)) {
      const existing = new Set(
        storage.map((item) => `${item.x},${item.y},${item.z}`)
      );

      var all_time = 0;
      while (storage.length < length * breadth * height) {
        x = getRandomInt(0, length - 1);
        y = getRandomInt(0, breadth - 1);
        z = getRandomInt(0, height - 1);
        const key = `${x},${y},${z}`;
        
        if (!existing.has(key)) {
          time=0;
          storage.push({ x, y, z });
          existing.add(key);
          all_time += calculate_time(x, y, z, time, trf_t, climb_t, turn_t);
        }
      }
      console.log(storage);
      setResult(<Paper elevation={0} style={{ alignContent: "center", backgroundColor: "lightgreen", width: '100%', minWidth: 300, minHeight: 250 }}>
        倉庫面積：{length * breadth * height} units² <br />
        膠箱數量：{Math.floor((length)*(breadth-1)*(height-1)*0.9)} <br />
        Total Time: {all_time.toFixed(2)} s
      </Paper>);
    }

    /***********************
     *    Pick Selected    *
     ***********************/
    else if ((!checked_all && !checked_random) && ((formData.get("x")) != '' && formData.get("y") != '' && formData.get("z") != '')) {
      x = Number(formData.get("x"));
      y = Number(formData.get("y"));
      z = Number(formData.get("z"));

      time = 0;
      //Horizontal Movement
      time = calculate_time(x, y, z, time, trf_t, climb_t, turn_t);
      // if (x == 0 && y > 0) {  //A Column
      //   console.log("caseA");
      //   if (y == 1) { time = move_t_1; }
      //   else { time = move_t_1 + y * move_t_long; } //Each additional grid add extra 0.6s 
      // } else if (x == 1 && y > 0) {  //B Column
      //   console.log("caseB");
      //   if (y == 1) { time = (x + y) * move_t_1 + trf_t; }
      //   else {
      //     time = move_t_1 + y * move_t_long + trf_t;
      //     console.log(time);
      //   }
      // } else if (x > 1 && y > 0) { //others
      //   console.log("caseC");
      //   if (y == 1) { time = x * move_t_long + y * move_t_1 + trf_t; }
      //   else { time = x * move_t_long + y * move_t_long + trf_t; }
      // }

      // //Vertical Movement
      // if (z != 0) {
      //   time += trf_t + (z - 1) * climb_t;
      // }

      //const moves = 1 + length + breadth + height;
      //const totaltime = moves*move_t + 
      setResult(<Paper elevation={0} style={{ alignContent: "center", backgroundColor: "lightgreen", width: '100%', minWidth: 300, minHeight: 250 }}>
        倉庫面積：{length * breadth * height} units² <br />
        膠箱數量：{Math.floor((length)*(breadth-1)*(height-1)*0.9)} <br />
        Total Time: {time} s
      </Paper>);
    } else {
      setResult(<Paper elevation={0} style={{ alignContent: "center", backgroundColor: "pink", width: '100%', minWidth: 300, minHeight: 250 }}>請輸入相關資料</Paper>);
    }
  }
  return (
    <form action={calculate}>
      <Stack
        gap={1}
        maxWidth={1500}
        width="100%"
        minWidth={400}
        direction="row"
        alignItems="stretch"
      >
        <Paper elevation={0} style={{
          backgroundColor: "white", borderColor: "#fcfdfb",
          borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
        }}>
          <Box display={'flex'} gap={4} flexDirection={'column'} alignItems="flex-start">
            <Typography variant="h5" fontWeight={"bold"} marginBottom={-2}>Warehouse Setting 倉庫設置</Typography>
            <Box display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'} >
              Length 长度 (unit): <TextField width={10} type="number" defaultValue={10} name="length" sx={{ flex: 1, width: "100px" }} />
              Breadth 宽度 (unit): <TextField type="number" name="breadth" defaultValue={10} sx={{ flex: 1, width: "100px" }} />
              Height 高度 (unit): <TextField type="number" name="height" defaultValue={10} sx={{ flex: 1, width: "100px" }} />
            </Box>
            <Box display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'}>
              移動速度 (m/s): <TextField name="move" disabled={true} sx={{ flex: 1, width: "150px" }} />
              轉向時間 (s): <TextField name="transform" defaultValue={2} sx={{ flex: 1, width: "150px" }} />
              爬升時間 (s): <TextField name="climb" defaultValue={2} sx={{ flex: 1, width: "150px" }} />
              {/*Pick/drop ==> slide up + rotate + slide down*/}
              Pick/Drop 時間 (s): <TextField name="rotate" defaultValue={3.5} sx={{ flex: 1, width: "150px" }} />
            </Box>
            <Divider orientation = "horizontal" flexItem />

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
            <Stack display="flex" flexDirection="row" alignItems="center" gap={2} width="100%" justifyContent="space-between"
            >
              {!checked_all && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Typography>x:</Typography>
                  <TextField name="x" type="number" sx={{ width: "100%" }} />
                </Box>
              )}
              {!checked_all && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Typography>y:</Typography>
                  <TextField name="y" type="number" sx={{ width: "100%" }} />
                </Box>
              )}
              {!checked_all && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Typography>z:</Typography>
                  <TextField name="z" type="number" sx={{ width: "100%" }} />
                </Box>
              )}
            </Stack>
          </Box>
          <Button type="submit" variant="outlined" style={{ marginTop: '10px' }}>計算</Button>
        </Paper>
        {result !== null && <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            boxSizing: 'border-box',
            border: 'none',
            outline: 'none',
            flex: 1, display: 'flex'
          }}
        > {result}</Box>}
      </Stack>
    </form>
  );
}

export default App
