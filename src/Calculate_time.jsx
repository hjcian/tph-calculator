import { Stack, Typography, Divider } from "@mui/material";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export function calculate_time(x, y, z, move_t_1, move_t_long, trf_t, climb_t, turn_t, all_storage, storage, pickingList=[], workstation, robotPosition) {
    let time = 0;
    let blocking_time = 0;
    console.log("x, y, z", x, y, z);

    console.log("ROB", robotPosition);
    if (storage != []) {

        //阻塞容器
        let blocking_container = storage
            .filter(item => item.x === x && item.y === y && item.z < z)
            .sort((a, b) => a.z - b.z);

        let empty_storage = all_storage.filter(pos =>
            !storage.some(filled =>
                filled.x === pos.x && filled.y === pos.y && filled.z === pos.z
            )
        );
        console.log("blocking_container", blocking_container);
        console.log("empty_storage", empty_storage);
        console.log("Check if pickinglist is passed properly:", [...pickingList.map(item => ({ ...item }))]);

        for (let container of blocking_container) {
            //console.log(container.x,container.y,container.z);
            const target = find_lowest_z_nearest_xy(container.x, container.y, empty_storage);

            console.log("target", target);
            if (target == null) {
                throw new Error("Not enough free space in storage. Please remove some containers and try again.");
            }

            //from start point to first blocking container
            blocking_time += point_to_point_time(robotPosition, container, trf_t, climb_t, turn_t, move_t_1, move_t_long, "");

            //console.log("target", container.x, container.y, empty_storage);
            blocking_time += point_to_point_time(container, target, trf_t, climb_t, turn_t, move_t_1, move_t_long, "");

            blocking_container = blocking_container.filter(items => !(items.x === container.x && items.y === container.y && items.z === container.z));
            storage = storage.filter(items => !(items.x === container.x && items.y === container.y && items.z === container.z));
            storage.push(target);
            robotPosition = target;

            const index = pickingList.findIndex(
                item => item.x === container.x && item.y === container.y && item.z === container.z
            );

            if (index !== -1) {
                pickingList[index] = target;
            }

            empty_storage = empty_storage.filter(items => !(items.x === target.x && items.y === target.y && items.z === target.z));
            empty_storage.push(container);
        }
    }

    //
    //  3 | I| J| K| L|
    //  2 | H| G| F| E|
    //  1 | A| B| C| D|
    //  0 |ws|            
    //     0   1  2  3
    //

    if (x >= 0 && y >= 0 && z > 0) {

        //Find nearest workstation
        const target_ws = find_lowest_z_nearest_xy(x, y, workstation);
        console.log("targetWS", target_ws);
        const pointArray = { x, y, z };
        console.log("pointArray", pointArray);

        //travel to container location
        time = point_to_point_time(robotPosition, pointArray, trf_t, climb_t, turn_t, move_t_1, move_t_long);
        console.log("robot move to container", time);
        robotPosition = pointArray;
        //travel to workstation
        time += point_to_point_time(pointArray, target_ws, trf_t, climb_t, turn_t, move_t_1, move_t_long, "workstation") * 2;

        // if (x == 0 && y > 0) {  //A Column
        //     if (y == 1) {
        //         ///console.log("caseA-1");
        //         time += move_t_1;
        //     }
        //     else {
        //         ///console.log("caseA-2");
        //         time += move_t_1 + (y - 1) * move_t_long;
        //     } //Each additional grid add extra 0.6s 
        // } else if (x == 1 && y > 0) {  //B Column
        //     if (y == 1) {
        //         ///console.log("caseB-1");
        //         time += move_t_1 + move_t_1 + trf_t;
        //     }
        //     else {
        //         ///console.log("caseB-2");
        //         time += move_t_1 + move_t_1 + (y - 1) * move_t_long + trf_t;
        //     }
        // } else if (x > 1 && y > 0) { //others

        //     if (y == 1) {
        //         ///console.log("caseC-1");
        //         time += move_t_1 + (x - 1) * move_t_long + move_t_1 + trf_t;
        //     }
        //     else {
        //         ///console.log("caseC-2");
        //         time += move_t_1 + (x - 1) * move_t_long + move_t_1 + (y - 1) * move_t_long + trf_t;
        //     }
        // }

        // //Vertical Movement
        // if (y != 0 && z > 0) {
        //     time += trf_t + z * climb_t + turn_t;
        // }
        console.log("Timenow", time);
        console.log("Total Blockingtime", blocking_time);
        console.log("Newest Picking List", [...pickingList.map(item => ({ ...item }))]);
        console.log("Undefiend storage", storage);

        const updatedPickingList = pickingList.filter(
            item => !(item.x === x && item.y === y && item.z === z)
        );
        
        console.log("updatedPickingList",updatedPickingList);
        console.log("CHECK",[storage, updatedPickingList, robotPosition, time, blocking_time]);
        return (!isNaN(time) && [storage, updatedPickingList, robotPosition, time, blocking_time]);
    };
}

function find_lowest_z_nearest_xy(x, y, locations) {
    let closest = null;
    let minZ = Infinity;
    let minSteps = Infinity;
    let oldX = null;
    let oldY = null;

    const locs = [...locations].sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.y !== b.y) return a.y - b.y;
        return b.z - a.z; // descending z
    });


    for (const slot of locs) {
        if (!(oldX === slot.x && oldY === slot.y)) {
            ///console.log(slot.x, slot.y, slot.z);
            if (slot.x === x && slot.y === y) continue;

            ///console.log("passed");
            const steps = Math.abs(slot.x - x) + Math.abs(slot.y - y);

            if (
                slot.z < minZ ||
                (slot.z === minZ && steps < minSteps)
            ) {
                minZ = slot.z;
                minSteps = steps;
                closest = slot;
            }
        }
        oldX = slot.x;
        oldY = slot.y;
    }

    return closest;
}

function point_to_point_time(container, target, trf_t, climb_t, turn_t, move_t_1, move_t_long, mode = "") {
    let add_time = 0;
    let x = container.x;
    let y = container.y;
    let z = container.z;

    let target_x = target.x;
    let target_y = target.y;
    let target_z = target.z;

    let x_distance = 0;
    let y_distance = 0;

    if (!(x == target_x && y == target_y)) {
        x_distance = Math.abs(x - target_x);
        y_distance = Math.abs(y - target_y);
        console.log("distances:", x_distance, y_distance);
        if (x_distance == 0) { // if only need move y direction
            //y >= 1
            add_time = move_t_1 + (y_distance - 1) * move_t_long;
        } else if (y_distance == 0) { // if only need move x direction
            add_time = move_t_1 + (x_distance - 1) * move_t_long;
        } else { //need move in both x and y direction
            add_time = move_t_1 + (x_distance - 1) * move_t_long + move_t_1 + (y_distance - 1) * move_t_long + trf_t;
            console.log("timenow", add_time);
        }
        add_time += z * climb_t + trf_t + turn_t;
        console.log("timenow2", add_time);
        if (mode == "workstation") {
            add_time += (target_z + 1) * climb_t + trf_t + turn_t;
        } else {
            add_time += (target_z) * climb_t + trf_t + turn_t;
        }
    }

    console.log("additional time", add_time);
    return add_time;
}

export function random_storage(length, breadth, height, full_percentage) {
    console.log('FULL', full_percentage);
    const storage = [];
    const total_bins = length * breadth * height;
    const target_fill = Math.floor(total_bins * full_percentage / 100);
    let filled_bins = 0;
    let attempts = 0;
    const maxAttempts = total_bins * 5;

    const columnMap = new Map(); // key = "x,y", value = next z to fill (starts at height)

    const getRandomInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    while (filled_bins < target_fill && attempts < maxAttempts) {
        const x = getRandomInt(0, length - 1);
        const y = getRandomInt(1, breadth);
        const key = `${x},${y}`;

        let currentZ = columnMap.has(key) ? columnMap.get(key) : height;

        if (currentZ < 1) {
            attempts++;
            continue;
        }

        // Place only one bin at the current top z position
        storage.push({ x, y, z: currentZ });
        currentZ--;

        columnMap.set(key, currentZ);
        filled_bins++;
        attempts++;
    }

    return storage;
    // let storage = []
    // const getRandomInt = (min, max) =>
    //     Math.floor(Math.random() * (max - min + 1)) + min;

    // const total_bins = length * breadth * height;
    // const target_fill = Math.floor(total_bins * 0.9);
    // let filled_bins = 0;
    // let attempts = 0;
    // const maxAttempts_bins = total_bins * 5;

    // const columnMap = new Map(); 

    // while (filled_bins < target_fill && attempts < maxAttempts_bins) {
    //     const x = getRandomInt(0, length - 1);
    //     const y = getRandomInt(1, breadth);
    //     const key = `${x},${y}`;

    //     // Get current top z level for this column (starts at height)
    //     let currentZ = columnMap.has(key) ? columnMap.get(key) : height;

    //     // If column is already full (z < 1), skip
    //     if (currentZ < 1) {
    //         attempts++;
    //         continue;
    //     }

    //     // Decide how many bins to stack this time (1 to currentZ + 1)
    //     const maxCanAdd = currentZ + 1;
    //     const remaining = target_fill - filled_bins;
    //     const binsToAdd = Math.min(getRandomInt(1, maxCanAdd + 1), remaining);

    //     for (let i = 0; i < binsToAdd && currentZ > 0; i++) {
    //         storage.push({ x, y, z: currentZ });
    //         currentZ--;
    //         filled_bins++;
    //     }

    //     columnMap.set(key, currentZ); // update next z position for this column
    //     attempts++;
    // }
    // return storage;
}

export default calculate_time;
