import { Stack, Typography, Divider, Paper } from "@mui/material";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export function display_result(work_t, inboundclash_t, time, relocate_time, pick_number, port_number) {

    let total_avg_time = (time + relocate_time) / pick_number;
    let work = work_t;
    let robot_multiplier = 1;
    for (robot_multiplier = 1; (work_t * robot_multiplier + inboundclash_t) < total_avg_time; robot_multiplier++) { //give no. of robots reccommended
        work = work_t * robot_multiplier + inboundclash_t;
    }

    console.log("work", work_t, "robot_multiplier", robot_multiplier, "total_avg_time", total_avg_time);

    let port_multiplier = 1;
    if (port_number > 1) {
        for (port_multiplier = 1; port_multiplier < port_number && work_t > (total_avg_time) * (port_multiplier + 1); port_multiplier++) {
            console.log("Port_multiplier", port_multiplier);
        }
    }

    return (
        <Stack direction={'row'} gap={1}>
            <Paper flex={7} elevation={0} style={{
                backgroundColor: "#94ebaeff", borderColor: "#fcfdfb",
                borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
            }}
            >
                <Stack display="flex" alignItems={'center'} direction={'column'} gap={1} >
                    <Typography>1 Robot</Typography>
                    <Typography variant="h4" fontWeight='bold'>Throughput Per Hour (TPH):{(((60 * 60) / ((relocate_time + time) / pick_number + work_t)) * port_multiplier).toFixed(2)}</Typography>
                    <BlockMath math="TPH = \frac{60\times60}{\text{Time for one full movement cycle (s)}}" />
                    <Typography>Total Time Spent 花費時間:{(time + relocate_time + (work_t * pick_number)).toFixed(2)} s </Typography>
                    <Typography>Total Time Spent on port:{(work_t * pick_number).toFixed(2)} s </Typography>
                    <Typography>Total Time Spent on Transporting:{(time + relocate_time).toFixed(2)} s</Typography>
                    <Typography>Total Time Spent on Time:{(time).toFixed(2)} s</Typography>
                    <Typography>Total Time Spent on Relocate:{(relocate_time).toFixed(2)} s</Typography>
                    <Divider orientation="horizontal" flexItem />
                    <Typography>Average Time Spent relocating for each container:{(relocate_time / (pick_number)).toFixed(2)} s</Typography>
                    <Typography>Average Time Spent Inbound & Outbound for each container:{(time / (pick_number)).toFixed(2)} s</Typography>
                    <Typography>Average Time Spent for each container:{((relocate_time + time) / pick_number + work_t).toFixed(2)} s</Typography>
                </Stack>
            </Paper>
            <Paper elevation={0} flex={3} style={{
                backgroundColor: "white", borderColor: "lightgray",
                borderWidth: 1, padding: 20, width: '100%', border: '1px solid #ccc'
            }}>
                <Stack display="flex" alignItems={'center'} direction={'column'} gap={1} >
                    <Typography variant="h4" fontWeight='bold'>Recommended No. of Robot(s):{robot_multiplier * port_number}</Typography>
                    <Typography>Estimated New TPH: {((((60 * 60 - (((relocate_time + time / 2) / pick_number) + work_t)) / (inboundclash_t + work_t)) + 1) * port_number).toFixed(2)} </Typography>
                    <div style={{ fontSize: '0.7em' }}>
                        <BlockMath math={`
TPH = \\left[ \\frac{60 \\times 60 - \\text{(relocate time + outbound time + work time)}}{\\text{work time}+\\text{inbound clash time}} +1\\right] \\times \\text{No. of Ports}
`} />
                    </div>
                </Stack>
            </Paper>
        </Stack>

    );
}