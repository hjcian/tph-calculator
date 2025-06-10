import { useState } from 'react'
import './App.css'
import Alert from '@mui/material/Alert';
import { TextField } from '@mui/material';

function App() {
  const [result, setResult] = useState(null);

  function calculate(formData) {
    if ((formData.get("length")) != '' && formData.get("breadth") != '' && formData.get("height") != '') {
      const length = Number(formData.get("length"));
      const breadth = Number(formData.get("breadth"));
      const height = Number(formData.get("height"));
      const moves = 1 + length + breadth + height;
      setResult(<Alert variant="filled" severity="success">Total moves: {moves}</Alert>);
    } else {
      setResult(<Alert severity="error">請輸入相關資料</Alert>);
    }
  }
  return (
    <form action={calculate}>
      <div style={{
        backgroundColor: "#F0F8FF", borderColor: "#fcfdfb",
        borderWidth: 2, padding: 20, display: 'flex', gap: 20, width: "500px"
      }}>
        <div style={{ width: '100%' }}>
          Length 长度: <TextField  name="length" /><br />
          Breadth 宽度: <TextField  name="breadth" /><br />
          Height 高度: <TextField  name="height" /><br />
        </div>
        <div style={{ width: '100%' }}>
          Moving time (s): <TextField  name="move" /><br />
          Transform time (s): <TextField  name="transform" /><br />
          Climbing time (s): <TextField  name="climb" /><br />
        </div>

      </div>
      <button type="submit" style={{ marginTop: '10px' }}>Calculate</button>
      {result !== null && <div style={{ marginTop: '10px' }}> {result}</div>}
    </form>

  );

  return (
    <>
      <div>

      </div>
      <h1>TPH Calculator</h1>
      <form className="card">
        <input name='length'></input>
        <input></input>
        <button type="submit">
          Calculate
        </button>
      </form>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
