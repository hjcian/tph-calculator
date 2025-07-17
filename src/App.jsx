// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import WarehouseCalculation from './pages/WarehouseCalculation.jsx';
import { Typography } from '@mui/material';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/warehouse" element={<WarehouseCalculation />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Typography variant='h6'>404 Not Found</Typography>} /> 
      </Routes>
    </>
  );
}
