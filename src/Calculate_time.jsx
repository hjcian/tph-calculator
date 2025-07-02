export function calculate_time(x, y, z, trf_t, climb_t, turn_t, all_storage, storage, mode = "default") {
    let time = 0;
    let blocking_time = 0;
    ///console.log("x, y, z", x, y, z);
    const move_t_1 = 4;
    const move_t_long = 0.6;
    ///console.log("IWANTSEESTORAGE HERE",storage);
    if (storage != [] ) {

        // storage.sort((a, b) => {
        //     if (a.x !== b.x) return a.x - b.x;     // primary sort: x ascending
        //     return a.y - b.y;                      // secondary sort: y ascending
        // });
        // console.log("new filled", storage);

        //阻塞容器
        let blocking_container = storage
            .filter(item => item.x === x && item.y === y && item.z < z)
            .sort((a, b) => a.z - b.z);

        if (mode != "default") {
            //如果有阻塞容器，但之後需要盤點，就不需要移開
            blocking_container = blocking_container.filter(blocking =>
                !storage.some(s =>
                    s.x === blocking.x && s.y === blocking.y && s.z === blocking.z
                )
            );
        }

        let empty_storage = all_storage.filter(pos =>
            !storage.some(filled =>
                filled.x === pos.x && filled.y === pos.y && filled.z === pos.z
            )
        );

        for (let container of blocking_container) {
            //console.log(container.x,container.y,container.z);
            const target = find_lowest_z_nearest_xy(container.x, container.y, empty_storage, storage);
            //console.log("target", container.x, container.y, empty_storage);
            blocking_time += remove_blocking_container(container, target, trf_t, climb_t, turn_t, move_t_1, move_t_long);
            blocking_container = blocking_container.filter(items => !(items.x === container.x && items.y === container.y && items.z === container.z));
            storage = storage.filter(items => !(items.x === container.x && items.y === container.y && items.z === container.z));
            storage.push(target);
            empty_storage = empty_storage.filter(items => !(items.x === target.x && items.y === target.y && items.z === target.z));
            empty_storage.push(container);
        }
    }

    ///console.log("TIME SPENT REMOVING CONTAINERS", blocking_time);

    if (mode != "default") {

    }
    //
    //  3 | I| J| K| L|
    //  2 | H| G| F| E|
    //  1 | A| B| C| D|
    //  0 |ws|            
    //     0   1  2  3
    //

    if (x >= 0 && y >= 0 && z > 0) {
        if (x == 0 && y > 0) {  //A Column
            if (y == 1) {
                ///console.log("caseA-1");
                time += move_t_1;
            }
            else {
                ///console.log("caseA-2");
                time += move_t_1 + (y - 1) * move_t_long;
            } //Each additional grid add extra 0.6s 
        } else if (x == 1 && y > 0) {  //B Column
            if (y == 1) {
                ///console.log("caseB-1");
                time += move_t_1 + move_t_1 + trf_t;
            }
            else {
                ///console.log("caseB-2");
                time += move_t_1 + move_t_1 + (y - 1) * move_t_long + trf_t;
            }
        } else if (x > 1 && y > 0) { //others

            if (y == 1) {
                ///console.log("caseC-1");
                time += move_t_1 + (x - 1) * move_t_long + move_t_1 + trf_t;
            }
            else {
                ///console.log("caseC-2");
                time += move_t_1 + (x - 1) * move_t_long + move_t_1 + (y - 1) * move_t_long + trf_t;
            }
        }

        //Vertical Movement
        if (y != 0 && z > 0) {
            time += trf_t + z * climb_t + turn_t;
        }
        ///console.log(time);
        return (!isNaN(time) ? [storage ,time, blocking_time] : "ERROR");
    } else return 0;
}

export function display_result(length, breadth, height, time, error,storage) {
    return (
        error === true ? ("Error") : (
            <>
                Maximum Storage Capacity 貨架數量：{length * breadth * height} units <br />
                No. of Container 膠箱數量：{storage.length} <br />
                Total Time Spent 花費時間：{(time * 2).toFixed(2)} s <br />
                Workstation TPH：
            </>
        )
    );
}

function find_lowest_z_nearest_xy(x, y, empty_storage, storage) {
    // let candidatesX = [];
    // let candidatesY = [];
    // let candidatesAny = [];

    // for (const slot of empty_storage) {
    //     if (slot.x === x && slot.y === y) continue; // same stack
    //     if (slot.y === y) candidatesX.push(slot);   // only x changes
    //     else if (slot.x === x) candidatesY.push(slot); // only y changes
    //     else candidatesAny.push(slot);             // both change
    // }

    // const pickLowestZ = (slots) => {
    //     let closest = null;
    //     let minZ = Infinity;
    //     for (const slot of slots) {
    //         if (slot.z < minZ) {
    //             minZ = slot.z;
    //             closest = slot;
    //         }
    //     }
    //     return closest;
    // };

    // return (
    //     pickLowestZ(candidatesX) ||
    //     pickLowestZ(candidatesY) ||
    //     pickLowestZ(candidatesAny)
    // );
    let closest = null;
    let minZ = Infinity;
    let minSteps = Infinity;
    let oldX = null;
    let oldY = null;

    empty_storage.sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.y !== b.y) return a.y - b.y;
        return b.z - a.z; // descending z
    });

    ///console.log("Empty storage",empty_storage);

    for (const slot of empty_storage) {
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


function remove_blocking_container(container, target, trf_t, climb_t, turn_t, move_t_1, move_t_long) {
    ///console.log("container:", container, "target:", target);
    let add_time = 0;
    let x = container.x;
    let y = container.y;
    let z = container.z;
    ///console.log("remove", x, y, z);

    let target_x = target.x;
    let target_y = target.y;
    let target_z = target.z;

    let x_distance = 0;
    let y_distance = 0;

    if (!(x == target_x && y == target_y)) {
        x_distance = Math.abs(x - target_x);
        y_distance = Math.abs(y - target_y);

        if (x_distance == 0) { // if only need move y direction
            //y >= 1
            add_time = move_t_1 + (y_distance - 1) * move_t_long;
        } else if (y_distance == 0) { // if only need move x direction
            add_time = move_t_1 + (x_distance - 1) * move_t_long;
        } else { //need move in both x and y direction
            add_time = move_t_1 + (x_distance - 1) * move_t_long + move_t_1 + (y_distance - 1) * move_t_long + trf_t;
        }
        add_time += z * climb_t + trf_t + turn_t;
        add_time += target_z * climb_t + trf_t + turn_t;
    }

    ///console.log("additional time", add_time);
    return add_time;
}

export function random_storage(length, breadth, height) {

    const storage = [];
    const total_bins = length * breadth * height;
    const target_fill = Math.floor(total_bins * 0.9);
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
