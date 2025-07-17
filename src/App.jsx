// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import WarehouseCalculation from './pages/WarehouseCalculation.jsx';
import { Navigate } from 'react-router-dom';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/warehouse" element={<WarehouseCalculation />} />

        {/* TO REPLACE when developed */}
        <Route path="/about" element={<About />} />
        <Route path="*" element={<h1>404 Not Found</h1>} /> 
      </Routes>
    </>
  );
}
