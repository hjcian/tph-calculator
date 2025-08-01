import { useState, useRef, useMemo, useEffect } from 'react';
import { TextField, Paper, Grid, Button, Stack, Divider, Typography, Alert, Snackbar, Box, Backdrop } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { LoadingCircle } from '../../component/Loading.jsx';

//Functions
import { calculate_time, random_storage } from './Calculate_time.jsx';
import { display_result } from './Display_result.jsx'

//Reusable components
import { AntSwitch } from '../../component/AntSwitch.jsx';

import CustomizedDialogs from '../../component/Dialog.jsx'; // not reusable yet!
import InputRowsSection from '../../component/Input_Rows.jsx';
import StorageTable from '../../component/table.jsx';
import StorageScene from '../../component/3d.jsx'; // not reusable yet!

//Icons
import WarehouseIcon from '@mui/icons-material/Warehouse';
import EngineeringIcon from '@mui/icons-material/Engineering';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SmartToySharpIcon from '@mui/icons-material/SmartToySharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function WarehouseCalculation() {
  const [result, setResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const resultRef = useRef(null);
  const container_LocationRef = useRef(null);
  const pickingListRef = useRef(null);
  const portRef = useRef(null);
  const [portRows, setportRows] = useState({});
  const [storageRows, setStorageRows] = useState({});
  const [pickingRows, setPickingRows] = useState({});
  const [pickingList, setPickingList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // const [length, setLength] = useState(5);
  // const [breadth, setBreadth] = useState(5);
  // const [height, setHeight] = useState(5);

  const [storage, setStorage] = useState([]);
  const [port, setPort] = useState([{ x: 1, y: 0, z: 0 }]);

  const [robotRows, setRobotRows] = useState({});
  const [robotPosition, setRobotPosition] = useState([{ x: 0, y: 0, z: 1 }]);

  const [isClearingAll, setIsClearingAll] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [smartRelocation, setSmartRelocation] = useState(true);
  ///
  // const [move_t_1, setMove_t_1] = useState(4);
  // const [move_t_long, setMove_t_long] = useState(0.6);
  // const [trf_t, setTrf_t] = useState(2);
  // const [climb_t, setClimb_t] = useState(2);
  // const [turn_t, setTurn_t] = useState(3.5);
  // const [work_t, setWork_t] = useState(30);

  //const [full_percentage, setFull_Percentage] = useState(90);

  const [settings, setSettings] = useState({
    move_t_1: 4,
    move_t_long: 0.6,
    trf_t: 2,
    climb_t: 2,
    turn_t: 3.5,
    work_t: 30,
    length: 5,
    breadth: 5,
    height: 5,
    full_percentage: 90,
  });



  const [fieldErrors, setFieldErrors] = useState({
    length: '',
    breadth: '',
    height: '',
    move_t_1: '',
    move_t_long: '',
    trf_t: '',
    climb_t: '',
    turn_t: '',
    work_t: '',
    full_percentage: '',
  });

  useEffect(() => {
    if (isClearingAll) {
      setIsClearingAll(false);
      return;
    }

    if (pickingList.length !== 0) {
      const confirmClear = window.confirm("Changes have been made in storage. Do you want to clear the picking list? This cannot be reversed.");
      if (confirmClear) {
        setPickingList([]);
      }
    }
  }, [storage]);


  useEffect(() => {
    if (port.length === 0) {
      setRobotPosition([{ x: NaN, y: NaN, z: NaN }]);
    } else {
      const p = port[0];
      setRobotPosition([{
        x: p.x,
        y: p.y,
        z: p.z + 1
      }])
    }
  }, [port]);

  useEffect(() => {
    setStorage([]);
    setPort([{ x: 1, y: 0, z: 0 }]);
  }, [settings.length, settings.breadth, settings.height]);

  useEffect(() => {
    setSubmit(false);
  }, [settings.length, settings.breadth, settings.height, storage, port, robotPosition, pickingList]);

  const handleDeleteItem = (indexToDelete, setFunction) => {
    setFunction((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  // const handleDimensionChange = (field, value) => {
  //   const numVal = parseInt(value);
  //   const floatVal = parseFloat(value);
  //   // Update value
  //   if (field === 'length') setLength(numVal);
  //   else if (field === 'breadth') setBreadth(numVal);
  //   else if (field === 'height') setHeight(numVal);
  //   else if (field === 'move_t_1') setMove_t_1(floatVal);
  //   else if (field === 'move_t_long') setMove_t_long(floatVal);
  //   else if (field === 'trf_t') setTrf_t(floatVal);
  //   else if (field === 'climb_t') setClimb_t(floatVal);
  //   else if (field === 'turn_t') setTurn_t(floatVal);
  //   else if (field === 'work_t') setWork_t(floatVal);
  //   else if (field === 'full_percentage') setFull_Percentage(floatVal);
  // };

  const handleDimensionChange = (field, value) => {
    const isIntegerField = ['length', 'breadth', 'height'].includes(field);
    const parsedValue = isIntegerField ? parseInt(value) : parseFloat(value);

    setSettings(prev => ({
      ...prev,
      [field]: parsedValue,
    }));
  };

  const validateInputs = () => {
    const newErrors = {};

    const fields = {
      length: settings.length,
      breadth: settings.breadth,
      height: settings.height,
      trf_t: settings.trf_t,
      climb_t: settings.climb_t,
      turn_t: settings.turn_t,
      work_t: settings.work_t,
      full_percentage: settings.full_percentage,
    };

    for (const [key, value] of Object.entries(fields)) {
      const isDimension = ['length', 'breadth', 'height'].includes(key);

      const num = Number(value);

      if (value === '' || isNaN(num)) {
        newErrors[key] = '必填數字';
      } else if (isDimension && value < 1) {
        newErrors[key] = '必須輸入 ≥ 1';
      } else if (!isDimension && value <= 0) {
        newErrors[key] = '必須輸入 > 0';
      } else if (isDimension && !Number.isInteger(value)) {
        newErrors[key] = '必須是整數';
      } else if (key === 'full_percentage' && value > 100) {
        newErrors[key] = '必須輸入 ≤ 100'
      }
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0; // valid if no errors
  };

  const handleFinalSubmit = async () => {
    setSubmit(true);

    if (validateInputs()) {
      // proceed with computation
      console.log("All valid, proceeding...");
      setIsLoading(true);
      //newStorage = random_storage(length, breadth, height);
      Promise.resolve().then(() => {
        calculate(storage);
      });
      //setStorage(newStorage);
      await new Promise(resolve => setTimeout(resolve, 0)); // let the UI update

    }
  };

  const all_storage = useMemo(() => {
    const list = [];
    for (let x = 1; x <= settings.length; x++) {
      for (let y = 1; y <= settings.breadth; y++) {
        for (let z = 1; z <= settings.height; z++) {
          list.push({ x, y, z });
        }
      }
    }
    return list;
  }, [settings.length, settings.breadth, settings.height]);

  const handle_calculate_all = () => {
    setPickingList(storage);
  };

  const handle_relocation_method = () => {
    if (smartRelocation == false) {
      setSmartRelocation(true);
    } else {
      setSmartRelocation(false);
    }
  }
  const handle_random_calculate = () => {
    let shuffledList = [...pickingList];
    let i;
    for (i = shuffledList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
    }
    setPickingList(shuffledList);
  };

  const handle_sort_calculate = () => {
    let sortedPickingList = [...pickingList].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      if (a.y !== b.y) return a.y - b.y;
      return a.z - b.z;
    });
    setPickingList(sortedPickingList);
  };

  const handle_generate_random_storage = () => {
    if (validateInputs()) {
      if (storage.length > 0 || (robotPosition.some(pos => !(pos.x === 1 && pos.y === 0 && pos.z === 1)))) {
        const confirmClear = window.confirm(`Are you sure you want to re-generate storage?${((pickingList.length > 0 || robotPosition.some(pos => !(pos.x === 1 && pos.y === 0 && pos.z === 1)))) ? "\nThis will also affect the following:" : ''}${pickingList.length > 0 ? `\n- Clear existing picking list.` : ''}${robotPosition.some(pos => !(pos.x === 1 && pos.y === 0 && pos.z === 1)) ? `\n- Reset Robot position.` : ''}\n\nThis action cannot be reversed.`);

        let newStorage = random_storage(settings.length, settings.breadth, settings.height, settings.full_percentage);
        if (confirmClear) {
          setIsClearingAll(true);
          newStorage = [...newStorage].sort((a, b) => {
            if (a.x !== b.x) return a.x - b.x;
            if (a.y !== b.y) return a.y - b.y;
            return a.z - b.z;
          });
          setStorage(newStorage);
          setPickingList([]);
          setRobotPosition([
            { ...port[0], z: port[0].z + 1 },
            ...port.slice(1)
          ]);
        }
      } else {
        let newStorage = random_storage(settings.length, settings.breadth, settings.height, settings.full_percentage);
        newStorage = [...newStorage].sort((a, b) => {
          if (a.x !== b.x) return a.x - b.x;
          if (a.y !== b.y) return a.y - b.y;
          return a.z - b.z;
        });
        setStorage(newStorage);
      }
    }
  };

  const handle_delete_all = () => {
    const confirmClear = window.confirm(`Are you sure you want to clear storage?${pickingList.length > 0 ? " This will also clear existing picking list." : ""} This action cannot be reversed.`);
    if (confirmClear) {
      setIsClearingAll(true);
      setStorage([]);
      setPickingList([]);
    }
    console.log("Deleted Storage", storage);
    // console.log("storage gen", newStorage);
  };

  const handle_delete_all_list = () => {
    setPickingList([]);
    // console.log("storage gen", newStorage);
  };

  const handle_delete_allport = () => {
    setPort([]);
  };

  const scrollAndNotify = (ref, message, severity = "error") => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    if (message) {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    }
  };

  function calculate(calculate_storage = []) {
    console.log("Robot position", robotPosition);
    //setResult('');

    let time = 0;
    let relocate_time = 0;

    if (port.length === 0) {
      scrollAndNotify(portRef, "No port 無工作站口");
    } else if (storage.length === 0) {
      scrollAndNotify(container_LocationRef, "No Storage 無庫存");
    } else if (pickingList.length === 0) {
      scrollAndNotify(pickingListRef, "No Picking List 無揀貨單");
    }

    let newStorage = calculate_storage;
    let newPickingList = pickingList.map(item => ({ ...item }));
    let newRobotPosition = robotPosition[0] || {};;
    console.log("PICKINGLIST Will update", [...newPickingList.map(item => ({ ...item }))]);
    if (port.length === 0) {
      return;
    }

    const movementTimes = {
      move_t_1: settings.move_t_1,
      move_t_long: settings.move_t_long,
      trf_t: settings.trf_t,
      climb_t: settings.climb_t,
      turn_t: settings.turn_t,
    };

    const runLoop = async () => {
      while (newPickingList.length > 0) {
        const containers = newPickingList[0];
        try {
          const [newestStorage, newestPickingList, newestRobotPosition, deltaTime, deltaRelocate] = calculate_time(containers.x, containers.y, containers.z, movementTimes, all_storage, newStorage, newPickingList, port, newRobotPosition, smartRelocation);
          time += deltaTime;
          relocate_time += deltaRelocate;
          newStorage = newestStorage;
          newPickingList = newestPickingList;
          newRobotPosition = newestRobotPosition;
          await new Promise((res) => setTimeout(res, 0));
        } catch (err) {
          console.error(err.message);
          setSnackbarMessage(err.message); // show error UI
          setSnackbarOpen(true);
          setIsLoading(false);
          return ('');
        }
      }
      setIsLoading(false);

      if (pickingList.length > 0) {
        const inboundclash_t = settings.move_t_1 + settings.trf_t + settings.climb_t + settings.turn_t + settings.climb_t + settings.move_t_1;

        setResult(
          <Grid ref={resultRef}>
            {display_result(settings.work_t, inboundclash_t, time, relocate_time, pickingList.length, port.length)}
          </Grid>
        );

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100)
      }
    };

    runLoop();
    //setStorage(newStorage);
    //setPickingList(newPickingList);

    return ([time, relocate_time]);
  }

  return (
    <Grid>
      {isLoading && (
        <LoadingCircle />
      )}
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
      >
        <Stack direction="row" gap={2} alignItems="stretch" sx={{ alignItems: 'stretch' }}>
          <Stack spacing={2} width={"100%"}>
            <Accordion defaultExpanded sx={{
              border: '1px solid', boxShadow: 'none', borderRadius: 2, borderColor: !!(fieldErrors.length || fieldErrors.breadth || fieldErrors.height) ? 'red' : '#ccc',
              '&:before': {
                display: 'none',
              },
            }}>
              <AccordionSummary
                component="div"
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ paddingLeft: 2 }}
                overflow='hidden'
              >
                <Stack direction="column" overflow='hidden'>
                  <Typography variant="h6" fontWeight={"bold"}> <Box display="flex" alignItems="center" gap={1}><WarehouseIcon /> Nexano Layout 倉庫佈局</Box></Typography>
                  <Typography marginRight={1} color={'gray'}>Maximum Location 最大諸位數量: {settings.length * settings.breadth * settings.height}</Typography>
                </Stack>
              </AccordionSummary>
              {/* <CustomizedDialogs /> */}
              <AccordionDetails>
                <Stack direction={'column'} gap={1}>
                  <Grid justifyContent={'flex-start'} borderRadius={2} display="flex" gap={1} flexDirection={'row'} alignItems={'center'} backgroundColor={"#FAFAFA"} padding={2}>
                    <Typography flex={1}>Length 長度 (unit):</Typography> <TextField
                      value={settings.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      error={!!fieldErrors.length}
                      label={fieldErrors.length}
                      type="number"
                      step="1"
                      name="length"
                      sx={{ flex: 1 }} />

                    <Typography flex={"1"}>Breadth 寬度 (unit):</Typography>
                    <TextField
                      value={settings.breadth}
                      onChange={(e) => handleDimensionChange('breadth', e.target.value)}
                      error={!!fieldErrors.breadth}
                      label={fieldErrors.breadth}
                      type="number"
                      name="breadth"
                      sx={{ flex: 1 }} />

                    <Typography flex={"1"}>Height 高度 (unit):</Typography> <TextField
                      value={settings.height}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      error={!!fieldErrors.height}
                      label={fieldErrors.height}
                      type="number"
                      name="height"
                      sx={{ flex: "1" }} />

                  </Grid>
                  {/* <Grid borderRadius={2} display="flex" gap={1} width="100%" flexDirection={'row'} alignItems={'center'} backgroundColor={"#FAFAFA"} padding={2}>
                <Typography fontWeight={'bold'}>Exclude Column: </Typography>
              </Grid> */}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{
              border: '1px solid', boxShadow: 'none', borderRadius: 2, borderColor: submit
                ? ((fieldErrors.work_t || port.length === 0) ? 'red' : '#ccc')
                : '#ccc',
              '&:before': {
                display: 'none',
              },
            }} ref={portRef} >
              <AccordionSummary
                component="div"
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ paddingLeft: 2 }}
                overflow='hidden'
              >
                <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="column">
                    <Typography variant="h6" fontWeight={"bold"}>
                      <Box display="flex" alignItems="center" gap={1}><EngineeringIcon /> Port(s) Setting 工作站口設置 </Box>
                    </Typography>
                    <Typography marginRight={1} color={'gray'}>No. of Port(s) 工作站口數量: {port.length}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" sx={{ marginRight: 2 }}>
                    <Typography marginRight={1}>作業時間 (s):</Typography>
                    <TextField
                      value={settings.work_t}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { handleDimensionChange('work_t', e.target.value) }}
                      error={!!fieldErrors.work_t}
                      label={fieldErrors.work_t}
                      name="work_t"
                      type='number'
                      sx={{ flex: 1, maxWidth: 120 }} />
                  </Stack>
                </Stack>

              </AccordionSummary>
              {/* <CustomizedDialogs /> */}
              <AccordionDetails>
                <Stack direction={'column'} gap={1}>
                  <Typography sx={{ alignSelf: 'flex-start' }}>Port Location:</Typography>
                  {port.length > 0 && <StorageTable storage={port} onDelete={(index) => handleDeleteItem(index, setPort)} onDeleteAll={handle_delete_allport} />}
                  <InputRowsSection
                    type="port"
                    newRow={portRows}
                    setNewRow={setportRows}
                    list={port}
                    setList={setPort}
                    length={settings.length}
                    breadth={settings.breadth}
                    height={settings.height}
                    storage={storage}
                    all_storage={all_storage}
                    port={port}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{
              border: '1px solid #ccc', boxShadow: 'none', borderRadius: 2,
              borderColor: submit && (!!(fieldErrors.full_percentage || storage.length == 0)) ? 'red' : '#ccc',
              '&:before': {
                display: 'none',
              },
            }} ref={container_LocationRef}>
              <AccordionSummary
                component="div"
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ paddingLeft: 2 }}
                overflow='hidden'
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Stack direction="column">
                    <Typography variant="h6" fontWeight={"bold"}><Box display="flex" alignItems="center" gap={1}><InventoryIcon />Container(s) Setting 容器位置</Box> </Typography>
                    <Typography marginRight={1} color={'gray'}>No. of Container(s) 容器數量: {storage.length}</Typography>
                  </Stack>
                  <Stack direction="row" gap={3} alignItems="center" ml="auto" sx={{ marginRight: 2 }}>
                    <Stack flex={3} direction={'row'} alignItems={'center'} gap={1}>
                      <TextField
                        value={settings.full_percentage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { handleDimensionChange('full_percentage', e.target.value) }}
                        error={!!fieldErrors.full_percentage}
                        label={fieldErrors.full_percentage}
                        type="number"
                        name="full_percentage"
                        sx={{ flex: 1, maxWidth: 80, minWidth: 65 }} />
                      <Typography>% Full</Typography>
                    </Stack>

                    <Box flex={7} maxWidth={200}>
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={(e) => {
                          e.stopPropagation();
                          handle_generate_random_storage();
                        }}
                        sx={{
                          backgroundColor: "#dd5716",
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          minWidth: 'auto',
                          width: '100%',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          position: 'relative',
                          zIndex: 1,
                          overflow: 'hidden'
                        }}
                      >
                        {storage.length > 0 ? 'Re-g' : 'G'}enerate Random Storage <br />{storage.length > 0 ? '重新' : ''}隨機建立庫存
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  {storage.length > 0 && <StorageTable storage={storage} onDelete={(index) => handleDeleteItem(index, setStorage)} onDeleteAll={handle_delete_all} />}
                  <InputRowsSection
                    type="storage"
                    newRow={storageRows}
                    setNewRow={setStorageRows}
                    list={storage}
                    setList={setStorage}
                    length={settings.length}
                    breadth={settings.breadth}
                    height={settings.height}
                    storage={storage}
                    all_storage={all_storage}
                    port={port}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{
              border: '1px solid #ccc', boxShadow: 'none', borderRadius: 2,
              '&:before': {
                display: 'none',
              },
            }}>
              <AccordionSummary
                component="div"
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ paddingLeft: 2 }}
                overflow='hidden'
              >
                <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center" sx={{ marginRight: 2 }}>
                  <Typography variant="h6" fontWeight={"bold"}><Box display="flex" alignItems="center" gap={1}><SmartToySharpIcon /> RGV Setting 機器人設置 </Box></Typography>
                  <Typography color={'gray'}>Current Node ({robotPosition[0].x},{robotPosition[0].y},{robotPosition[0].z})</Typography>
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack direction={'column'} gap={2}>
                  <Stack borderRadius={2} display="flex" gap={1} flexDirection={'column'} backgroundColor={"#FAFAFA"} padding={2}>
                    <Stack flexDirection={'row'} alignItems={'center'} gap={2}>
                      <Typography sx={{ width: 140 }}>移動時間 (s)<br />（首格）:</Typography>
                      <TextField
                        value={settings.move_t_1}
                        onChange={(e) => handleDimensionChange('move_t_1', e.target.value)}
                        error={!!fieldErrors.move_t_1}
                        label={fieldErrors.move_t_1}
                        name="move_t_1"
                        type='number'
                        sx={{ flex: 1 }}
                      />
                      <Typography sx={{ width: 140 }}>移動時間 (s)<br />（每增加一格）:</Typography>
                      <TextField
                        value={settings.move_t_long}
                        onChange={(e) => handleDimensionChange('move_t_long', e.target.value)}
                        error={!!fieldErrors.move_t_long}
                        label={fieldErrors.move_t_long}
                        name="move_t_long"
                        type='number'
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'} gap={2}>
                      <Typography sx={{ width: 140 }}>轉向時間 (s):</Typography>
                      <TextField
                        value={settings.trf_t}
                        onChange={(e) => handleDimensionChange('trf_t', e.target.value)}
                        error={!!fieldErrors.trf_t}
                        label={fieldErrors.trf_t}
                        name="trf_t"
                        type='number'
                        sx={{ flex: 1, ml: 'auto', maxWidth: 250 }} />
                      <Typography sx={{ width: 140 }}>爬升時間 (s):</Typography>
                      <TextField
                        value={settings.climb_t}
                        onChange={(e) => handleDimensionChange('climb_t', e.target.value)}
                        error={!!fieldErrors.climb_t}
                        label={fieldErrors.climb_t}
                        name="climb_t"
                        type='number'
                        sx={{ flex: 1, maxWidth: 250 }} />
                      {/*Pick/drop ==> slide up + rotate + slide down*/}

                    </Stack>
                    <Stack flexDirection={'row'} alignItems={'center'} gap={2}>
                      <Typography sx={{ width: 140 }}>Pick/Drop 時間 (s):</Typography>
                      <TextField
                        value={settings.turn_t}
                        onChange={(e) => handleDimensionChange('turn_t', e.target.value)}
                        error={!!fieldErrors.turn_t}
                        label={fieldErrors.turn_t}
                        name="turn_t"
                        type='number'
                        sx={{ flex: 1, ml: 'auto' }} />
                      <Typography sx={{ width: 140 }}></Typography>
                      <Box sx={{ flex: 1 }} />
                    </Stack>
                  </Stack>
                  <Stack gap={1} backgroundColor={"#FAFAFA"} padding={2}>
                    <Stack direction={'row'} gap={3}>
                      <Typography sx={{ textAlign: 'left', fontWeight: 'bold' }}>Starting Node:</Typography>
                    </Stack>

                    <InputRowsSection
                      type="robot"
                      newRow={robotRows}
                      setNewRow={setRobotRows}
                      list={robotPosition}
                      setList={setRobotPosition}
                      length={settings.length}
                      breadth={settings.breadth}
                      height={settings.height}
                      storage={storage}
                      all_storage={all_storage}
                      port={port}
                    />
                  </Stack>

                </Stack>

              </AccordionDetails>
            </Accordion>

            <Accordion sx={{
              border: '1px solid ', boxShadow: 'none', borderRadius: 2,
              borderColor: submit
                ? ((pickingList.length === 0) ? 'red' : '#ccc')
                : '#ccc',
              '&:before': {
                display: 'none',
              },
            }}>
              <AccordionSummary
                component="div"
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ paddingLeft: 2 }}
                ref={pickingListRef}
                overflow='hidden'
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Stack direction="column">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ textAlign: 'left' }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <ListAltIcon />
                        Picking Container(s) 目標容器
                      </Box>
                    </Typography>
                    <Typography marginRight={1} color={'gray'}>Container Count 目標容器數量: {pickingList.length}</Typography>
                  </Stack>
                  <Stack direction={"row"} gap={2} sx={{ marginRight: 2 }} alignItems={'center'} >
                    {pickingList.length == 0 && <Button type="button" variant="contained" disabled={storage.length == 0} disableElevation onClick={(e) => { e.stopPropagation(); handle_calculate_all(); }}
                      sx={{
                        backgroundColor: 'orange',
                      }}>Pick All 全選</Button>}

                    {pickingList.length > 0 &&
                      <Stack alignItems={'center'} direction={'column'} sx={{
                        backgroundColor: '#FAFAFA', padding: 1, borderRadius: 2, border: "1px solid #ccc"
                      }}
                        onClick={(e) => { e.stopPropagation(); handle_relocation_method(); }}
                      >
                        <Typography sx={{
                          fontSize: '0.75rem',
                          minWidth: 'auto'
                        }}>SMART RELOCATE</Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto'
                          }}>Off</Typography>
                          <AntSwitch checked={smartRelocation} />
                          <Typography sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto'
                          }}>On</Typography>
                        </Stack>
                      </Stack>}
                    {pickingList.length > 0 && <Button type="button" variant="contained" disabled={pickingList.length <= 1} onClick={(e) => { e.stopPropagation(); handle_random_calculate(); }} disableElevation
                      sx={{
                        fontSize: '0.75rem', // scale down text
                        padding: '4px 8px',  // scale down padding
                        minWidth: 'auto',    // prevent fixed size
                      }}>Random Picking<br /> 隨機挑選</Button>}
                    {pickingList.length > 0 && <Button type="button" variant="contained" disabled={pickingList.length <= 1} onClick={(e) => { e.stopPropagation(); handle_sort_calculate(); }} disableElevation
                      sx={{
                        backgroundColor: 'green',
                        fontSize: '0.75rem', // scale down text
                        padding: '4px 8px',  // scale down padding
                        minWidth: 'auto',    // prevent fixed size
                      }}>Best Pick<br />最優挑選</Button>}
                  </Stack>
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack direction={'column'} gap={2}>
                  {pickingList.length > 0 && <StorageTable storage={pickingList} onDelete={(index) => handleDeleteItem(index, setPickingList)} onDeleteAll={handle_delete_all_list} />}

                  <InputRowsSection
                    type="picking"
                    newRow={pickingRows}
                    setNewRow={setPickingRows}
                    list={pickingList}
                    setList={setPickingList}
                    length={settings.length}
                    breadth={settings.breadth}
                    height={settings.height}
                    storage={storage}
                    all_storage={all_storage}
                    port={port}
                  />
                </Stack>

              </AccordionDetails>
            </Accordion>
          </Stack>
          <Stack direction={'column'} gap={1} sx={{
            height: 370,
            width: 450,
            position: 'sticky',
            top: 70,
            alignSelf: 'flex-start',
          }}>
            <Paper
              sx={{
                height: '100%',
                border: '1px solid #ccc',
                borderRadius: 2,
                boxShadow: 'none',
                transition: 'height 0.3s ease',
                display: 'flex',
                alignItems: 'stretch',
                overflow: 'hidden'
              }}
              elevation={0}
            >{(settings.length > 0 && settings.breadth > 0 && settings.height > 0 && settings.length * settings.breadth * settings.height <= 2000) ? (<StorageScene storage={storage} all_storage={all_storage} port={port} robot={robotPosition} />) :
              <Grid height={'100%'} alignContent={'center'} margin={1}><Typography>Preview is unavailable for this configuration</Typography></Grid>}
            </Paper>
            <Button onClick={handleFinalSubmit} variant="contained" disableElevation sx={{ backgroundColor: "#dd5716", display: "flex", width: "100%" }}>計算時間</Button>
          </Stack>
        </Stack >
        {result}
      </Stack >
    </Grid >
  );
}
