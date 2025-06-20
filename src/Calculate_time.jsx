export function calculate_time(x, y, z, time, trf_t, climb_t, turn_t, mode) {
    console.log(x, y, z);
    //
    //  3 | I| J| K| L|
    //  2 | H| G| F| E|
    //  1 | A| B| C| D|
    //  0 |ws|            
    //     0   1  2  3
    //

    //time = 0;

    const move_t_1 = 4;
    const move_t_long = 0.6;

    if (x >= 0 && y >= 0 && z > 0) {
        if (x == 0 && y > 0) {  //A Column
            if (y == 1) {
                console.log("caseA-1");
                time += move_t_1;
            }
            else {
                console.log("caseA-2");
                time += move_t_1 + (y - 1) * move_t_long;
            } //Each additional grid add extra 0.6s 
        } else if (x == 1 && y > 0) {  //B Column
            if (y == 1) {
                console.log("caseB-1");
                time += move_t_1 + move_t_1 + trf_t;
            }
            else {
                console.log("caseB-2");
                time += move_t_1 + move_t_1 + (y - 1) * move_t_long + trf_t;
            }
        } else if (x > 1 && y > 0) { //others

            if (y == 1) {
                console.log("caseC-1");
                time += move_t_1 + (x - 1) * move_t_long + move_t_1 + trf_t;
            }
            else {
                console.log("caseC-2");
                time += move_t_1 + (x - 1) * move_t_long + move_t_1 + (y - 1) * move_t_long + trf_t;
            }
        }

        //Vertical Movement
        if (y != 0 && z > 0) {
            time += trf_t + z * climb_t + turn_t;
        }
        console.log(time);
        return (time);
    } else return 0;
}

export function display_result(length, breadth, height, time, error) {
    return (
        error===true ? ("") : (
            <>
                貨架數量：{length * breadth * height} units <br />
                膠箱數量（貨架的90%）：{Math.floor(length * breadth * height * 0.9)} <br />
                花費時間：{(time * 2).toFixed(2)} s <br />
                Maximum Throughput per Hour (TPH)：{((Math.floor(length * breadth * height * 0.9))/((time*2)/3600)).toFixed(2)} 
            </>
        )
    );
}

export default calculate_time;
