import React, { useState } from "react";
import {
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Box
} from "@mui/material";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


export default function Slot() {
  // Store inputs as strings so TextField works cleanly; convert when needed
  const [total_skus, setTotalSkus] = useState("1600");
  const [target_skus, setTargetSkus] = useState("600");
  const [slot, setSlot] = useState("4");

  const [nonZero, setNonZero] = useState(0); // last single-run result
  const [simData, setSimData] = useState([]); // array of { run, nonZero }
  const [stats, setStats] = useState(null);   // { min, max, mean }

  const [fieldErrors, setFieldErrors] = useState({
    total_skus: "",
    target_skus: "",
    slot: ""
  });

  // --- helpers -------------------------------------------------------------
  const parseIntSafe = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const simulateOnce = (total, target, slotSize) => {
    // containers = total_skus / slot
    const containers = Math.max(0, Math.floor(total / slotSize));
    if (containers === 0) return 0;

    // Hard capacity cap (4 per container per your logic)
    const maxCapacity = containers * 4;
    let remaining = Math.min(target, maxCapacity);

    const arr = new Array(containers).fill(0);
    for (let i = 0; i < containers && remaining > 0; i++) {
      let r = Math.floor(Math.random() * 4) + 1;
      if (r > remaining) r = remaining;
      arr[i] = r;
      remaining -= r;
    }
    return arr.reduce((acc, v) => (v > 0 ? acc + 1 : acc), 0);
  };

  // --- events --------------------------------------------------------------
  const handleDimensionChange = (field, value) => {
    // keep strings for inputs
    if (field === "total_skus") setTotalSkus(value);
    if (field === "target_skus") setTargetSkus(value);
    if (field === "slot") setSlot(value);
    // light validation example (optional)
    setFieldErrors((prev) => ({
      ...prev,
      [field]: value === "" ? "Required" : ""
    }));
  };

  // Single simulation (original behavior)
  const handleGenerateSingle = () => {
    const total = parseIntSafe(total_skus);
    const target = parseIntSafe(target_skus);
    const slotSize = parseIntSafe(slot);
    const nz = simulateOnce(total, target, slotSize);
    setNonZero(nz);
    console.log("Single run nonZero:", nz);
  };

  // 10,000 simulations + scatter data
  const handleGenerateMany = (runs = 10000) => {
  const total = parseIntSafe(total_skus);
  const target = parseIntSafe(target_skus);
  const slotSize = parseIntSafe(slot);

  const data = new Array(runs);
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (let i = 0; i < runs; i++) {
    const nz = simulateOnce(total, target, slotSize);
    data[i] = { run: i + 1, nonZero: nz };
    if (nz < min) min = nz;
    if (nz > max) max = nz;
    sum += nz;
  }
  const mean = sum / runs;

  setSimData(createHistogramData(data)); // Use histogram instead of raw
  setStats({ min, max, mean });
};


  const createHistogramData = (data) => {
    const counts = {};
    data.forEach((d) => {
      counts[d.nonZero] = (counts[d.nonZero] || 0) + 1;
    });
    return Object.entries(counts).map(([nonZero, count]) => ({
      nonZero: parseInt(nonZero, 10),
      count
    }));
  };
  // --- render --------------------------------------------------------------
  return (
    <Stack direction={"column"} gap={2}>
      {/* Inputs */}
      <Stack direction={"row"} alignItems={"center"} gap={1}>
        <Typography>SKUs 數量:</Typography>
        <TextField
          value={total_skus}
          onChange={(e) => handleDimensionChange("total_skus", e.target.value)}
          error={!!fieldErrors.total_skus}
          label={fieldErrors.total_skus}
          type="number"
          step="1"
          name="total_skus"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction={"row"} alignItems={"center"} gap={1}>
        <Typography>目標SKUs 數量:</Typography>
        <TextField
          value={target_skus}
          onChange={(e) => handleDimensionChange("target_skus", e.target.value)}
          error={!!fieldErrors.target_skus}
          label={fieldErrors.target_skus}
          type="number"
          step="1"
          name="target_skus"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction={"row"} alignItems={"center"} gap={1}>
        <Typography>Slot 數量:</Typography>
        <TextField
          value={slot}
          onChange={(e) => handleDimensionChange("slot", e.target.value)}
          error={!!fieldErrors.slot}
          label={fieldErrors.slot}
          type="number"
          step="1"
          name="slot"
          sx={{ flex: 1 }}
        />
      </Stack>

      {/* Action buttons */}
      <Stack direction="row" gap={2}>
        <Button variant="contained" onClick={handleGenerateSingle}>
          單次分配 Single Run
        </Button>
        <Button variant="outlined" onClick={() => handleGenerateMany(10000)}>
          10,000 次模擬 Simulate 10k
        </Button>
      </Stack>

      {/* Single run result */}
      <Typography>含有所要SKU的膠箱 (Single run): {nonZero}</Typography>

      {/* Stats from many runs */}
      {stats && (
        <>
          <Divider />
          <Typography variant="h6">模擬統計 Simulation Stats (10k runs)</Typography>
          <Typography>Min: {stats.min}</Typography>
          <Typography>Max: {stats.max}</Typography>
          <Typography>
            Mean: {stats.mean.toFixed(2)}
          </Typography>
        </>
      )}
      {simData.length > 0 && (
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nonZero" label={{ value: "NonZero Boxes", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Stack>
  );
}
