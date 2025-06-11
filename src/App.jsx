import { useState } from 'react'
import './App.css'
import Alert from '@mui/material/Alert';
import { TextField, Paper, Box, Button, Stack, Divider,Card } from '@mui/material';
import { green } from '@mui/material/colors';

function App() {
  const [result, setResult] = useState(null);
  const [moveTime, setMoveTime] = useState(0);
  const [trfTime, setTrfTime] = useState(0);
  const [climbTime, setClimbtime] = useState(0);

  function calculate(formData) {
    if ((formData.get("length")) != '' && formData.get("breadth") != '' && formData.get("height") != '') {
      const length = Number(formData.get("length"));
      const breadth = Number(formData.get("breadth"));
      const height = Number(formData.get("height"));

      const move_t = Number(formData.get("move"));
      const trf_t = Number(formData.get("transform"));
      const climb_t = Number(formData.get("climb"));
      const turn_t = Number(formData.get("turn"))+ 1.5; //需要加1.5s 

      const x = Number(formData.get("x"));
      const y = Number(formData.get("y"));
      const z = Number(formData.get("z"));

      const moves = 1 + length + breadth + height;
      //const totaltime = moves*move_t + 
      setResult(<Paper elevation={0} style={{backgroundColor: "lightgreen",padding:'100px'}}> 
      Total moves: {moves}
      Total moves: {moves}
      </Paper>);
    } else {
      setResult(<Paper backgroundColor={"pink"}>請輸入相關資料</Paper>);
    }
  }
  return (
    <form action={calculate}>
      <Stack gap={1} maxWidth={1500} height={350} width={"100%"} minWidth={400} direction={"row"} alignContent={'center'}>
        <Paper elevation={0} style={{
          backgroundColor: "white", borderColor: "#fcfdfb",
          borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
        }}>
          <Box display={'flex'} gap={4} flexDirection={'column'}>
            <Box display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'}>
              Length 长度: <TextField width={10} type="number" name="length" sx={{ flex: 1, width:"100px"}}/>
              Breadth 宽度: <TextField type="number" name="breadth" sx={{ flex: 1, width:"100px" }} />
              Height 高度: <TextField type="number" name="height"sx={{ flex: 1, width:"100px" }} />
            </Box>
            <Box display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'}>
              移動時間 (s): <TextField name="move" sx={{ flex: 1, width:"100px"}} />
              轉向時間 (s): <TextField name="transform"sx={{ flex: 1, width:"100px" }} />
              爬升時間 (s): <TextField name="climb" sx={{ flex: 1, width:"100px" }}/>
              轉盤時間 (s): <TextField name="rotate" sx={{ flex: 1, width:"100px" }}/>
            </Box>
            <Divider orientation="horizontal" flexItem />
            <Box display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'}>
              x: <TextField name="x" sx={{ flex: 1, width:"100px" }} />
              y: <TextField name="y" sx={{ flex: 1, width:"100px"}} />
              z: <TextField name="z" sx={{ flex: 1, width:"100px" }} />
            </Box>
          </Box>
          <Button type="submit" variant="outlined" style={{ marginTop: '10px' }}>Calculate</Button>
        </Paper>
        {result !== null && <Box style={{ height:"100%", maxwidth: 100, width: '100%'}}> {result}</Box>}
      </Stack>
    </form>
  );
}

export default App
