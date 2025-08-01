/**
 *  Calculates time spent for each container in picking list
 *  This time includes: 
 *      - M1: Robot Current Position -> Blocking Container (if needed)
 *      - R: Relocate that container
 *          *Repeat M1 and R till all blocking containers are removed*
 *      - M2: Robot Current Position -> Target Pick Container
 *      - Outbound: Target Pick Container -> Port Location (z+1)    |__ calculated once * 2
 *      - Inbound: Port Location -> Target Pick's Original Location |
 */

export function calculate_time(x, y, z, movementTimes, all_storage, storage, pickingList = [], port, robotPosition, smartRelocation) {
    let useful_time = 0;
    let blocking_time = 0;
    console.log('ALL', all_storage, "storage", storage, "pickingList", pickingList);
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

            //Find best location to relocate blocking container
            const target = find_best_location(
                {
                    x: container.x,
                    y: container.y,
                    locations: empty_storage,
                    pickingList: pickingList,
                    storage: storage,
                    smartRelocation: smartRelocation
                });

            console.log("target", target);

            // If storage capacity too full, or inappropriate storage configuration, will result in unavailable target
            if (target == null) {
                throw new Error("Not enough free space in storage. Please remove some containers and try again.");
            }
            // From robot position to blocking container
            blocking_time += point_to_point_time(robotPosition, container, movementTimes, "");

            console.log("Robot Position", robotPosition, "to Blocking Container", container, "is", blocking_time);

            //From blocking container to target location
            blocking_time += point_to_point_time(container, target, movementTimes, "");
            console.log("Blocking Container", container, "to Target location", target, "is", blocking_time);

            //Update blocking_container
            blocking_container = blocking_container.filter(items => !(items.x === container.x && items.y === container.y && items.z === container.z));

            //Update storage to update container's location
            storage = storage.filter(items => !(items.x === container.x && items.y === container.y && items.z === container.z));
            storage.push(target);
            robotPosition = target;

            //Check if the relocated blocking container is required in subsequent picking
            const index = pickingList.findIndex(
                item => item.x === container.x && item.y === container.y && item.z === container.z
            );

            // If there is, update its new location so we can locate it in the future
            if (index !== -1) {
                pickingList[index] = target;
            }

            //Update empty storage
            empty_storage = empty_storage.filter(items => !(items.x === target.x && items.y === target.y && items.z === target.z));
            empty_storage.push(container);
        }
    }


    /**
     * 
     * Outbound + Inbound 
     * 
     * */

    const pointArray = { x, y, z };

    //travel to container's location
    useful_time += point_to_point_time(robotPosition, pointArray, movementTimes);

    console.log("Robot from", robotPosition, "to wanted container", pointArray, "is", useful_time);

    robotPosition = pointArray; //Update robot current's position

    //Find nearest port
    const targetport = find_best_location(
        {
            x: x,
            y: y,
            locations: port,
            smartRelocation: true,
            mode: "port"
        }
    );

    console.log("targetport", targetport);

    /**
     * Travel to port and back
     * Therefore multiply by 2
     */

    useful_time += point_to_point_time(robotPosition, targetport, movementTimes, "port") * 2;
    console.log("wanted container", robotPosition, "to WS", targetport, "and back spend", useful_time);

    const updatedPickingList = pickingList.filter(
        item => !(item.x === x && item.y === y && item.z === z)
    );

    console.log("Total Useful_Time (in this cycle):", useful_time);
    console.log("Total Blocking Time (in this cycle):", blocking_time);
    console.log("Updated Picking List (in this cycle):", updatedPickingList);

    return (!isNaN(useful_time) && [storage, updatedPickingList, robotPosition, useful_time, blocking_time]);
}

function find_best_location({ x, y, locations, pickingList = [], storage = [], smartRelocation, mode = "" }) {

    let closest = null;
    let minSteps = Infinity;
    let oldX = null;
    let oldY = null;
    let minBlocking = Infinity;

    //Sort available location in descending z 

    const locs = [...locations].sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.y !== b.y) return a.y - b.y;
        return b.z - a.z; // descending z
    });

    // For each location in picking list, find number of blocking containers underneath it
    const taggedPickingList = pickingList.map(pick => {
        const blockers = storage.filter(s =>
            s.x === pick.x && s.y === pick.y && s.z < pick.z
        ).length;

        return {
            ...pick,
            blockers
        };
    });

    console.log("No.of blockers for each location", taggedPickingList);

    const highestBlockersPerXY = [];

    const blockerMap = new Map();

    //Set highest amount of blocking containers in each (x,y) stack

    for (const pick of taggedPickingList) {
        const key = `${pick.x},${pick.y}`;
        const existing = blockerMap.get(key);

        if (!existing || pick.blockers > existing.blockers) {
            blockerMap.set(key, pick);
        }
    }

    for (const [, pick] of blockerMap.entries()) {
        highestBlockersPerXY.push({ ...pick, blockers: pick.blockers + 1 }); //+1 because once the container is moved there, it'll increase by 1
    }

    console.log("Highest No.of blockers for each location", highestBlockersPerXY);

    const blockerLookup = new Map();
    for (const item of highestBlockersPerXY) {
        blockerLookup.set(`${item.x},${item.y}`, item.blockers);
    }

    const lowestInStack = {};
    //get the lowest z in each stack
    for (const item of storage) {
        const key = `${item.x},${item.y}`;
        if (!(key in lowestInStack)) {
            lowestInStack[key] = item.z;
        } else {
            lowestInStack[key] = Math.min(lowestInStack[key], item.z);
        }
    }

    if (smartRelocation) {
        /**
         * Smart Relocation
         * Finds the nearest stack which will cause the least blocking when new container is placed there
         * 
         * */
        for (const slot of locs) {
            if (!(oldX === slot.x && oldY === slot.y)) {    //check if its same xy as previous target
                console.log(slot.x, slot.y, slot.z);
                if (slot.x === x && slot.y === y) continue; //if same stack as blocking container then loop again

                const steps = Math.abs(slot.x - x) + Math.abs(slot.y - y);

                const key = `${slot.x},${slot.y}`;
                let blockers = blockerLookup.has(key) ? blockerLookup.get(key) : 0;
                console.log("No.of blockers for this location", blockers);

                if (mode !== 'port') {
                    if (slot.z >= lowestInStack[key]) continue;
                }

                if (
                    blockers < minBlocking ||
                    (blockers === minBlocking && steps < minSteps)
                ) {
                    minBlocking = blockers;
                    minSteps = steps;
                    closest = slot;
                }
            }
            oldX = slot.x;
            oldY = slot.y;
        }
    } else {
        /**
         * Random Relocation
         * Randomly relocate the container to any available (non-floating) slots
         * 
         * */
        const seen = new Set();
        const firstUniqueXYs = [];

        for (const item of locs) {
            const key = `${item.x},${item.y}`;
            if (!seen.has(key)) {
                seen.add(key);
                firstUniqueXYs.push({ x: item.x, y: item.y });
            }
        }

        const randomIndex = Math.floor(Math.random() * firstUniqueXYs.length);
        const { x: randX, y: randY } = firstUniqueXYs[randomIndex];

        // Find the highest available z in locs for that (x, y)
        const bestZ = locs.find(loc => loc.x === randX && loc.y === randY).z;

        closest = { x: randX, y: randY, z: bestZ };
    }

    return closest;
}

/**
 * Calculates time (in seconds) from 1 point to another
 * current: current location 
 * target: new location
 * Default mode is "", else mode="port"
 */

function point_to_point_time(current, target, movementTimes, mode = "") {
    const { move_t_1, move_t_long, trf_t, climb_t, turn_t } = movementTimes;

    let add_time = 0;
    let x = current.x;
    let y = current.y;
    let z = current.z;

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
        }
        add_time += z * climb_t + trf_t + turn_t;
        if (mode == "port") { // operator operates at z=1 while port location is at z=0
            add_time += (target_z + 1) * climb_t + trf_t + turn_t;
        } else {
            add_time += (target_z) * climb_t + trf_t + turn_t;
        }
    }
    return add_time;
}

/**
 * 
 * Generate random storage based on % provided by user
 * 
 */

export function random_storage(length, breadth, height, full_percentage) {
    const storage = [];
    const total_bins = length * breadth * height;
    const target_fill = Math.floor(total_bins * full_percentage / 100);
    let filled_bins = 0;
    let attempts = 0;
    const maxAttempts = total_bins * 5;

    //Ensures that container is placed 1 below current container in each (x,y) stack
    const columnMap = new Map(); // key = "x,y", value = next z to fill (starts at height)

    const getRandomInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    while (filled_bins < target_fill && attempts < maxAttempts) {
        const x = getRandomInt(1, length);
        const y = getRandomInt(1, breadth);
        const key = `${x},${y}`;

        let currentZ = columnMap.has(key) ? columnMap.get(key) : height;

        if (currentZ < 1) {
            attempts++;
            continue;
        }

        // Place only one bin below the current bottom z position
        storage.push({ x, y, z: currentZ });
        currentZ--;

        columnMap.set(key, currentZ);
        filled_bins++;
        attempts++;
    }

    return storage;
}

export default calculate_time;
