import { Stack, Typography, Divider, Paper } from "@mui/material";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export function display_result(work_t, inboundclash_t, time, relocate_time, pick_number, ws_number) {
    let multiply_ws = false;
    if(work_t>(time+relocate_time)/pick_number){
        multiply_ws = true;
    }
    return (
        <Stack direction={'row'} gap={1}>
            <Paper flex={7} elevation={0} style={{
                backgroundColor: "lightgreen", borderColor: "#fcfdfb",
                borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
            }}
            >
                <Stack display="flex" alignItems={'center'} direction={'column'} gap={1} >
                    <Typography>1 Robot</Typography>
                    <Typography variant="h4" fontWeight='bold'>Throughput Per Hour (TPH):{(((60 * 60) / ((relocate_time + time) / pick_number + work_t))*(multiply_ws ? ws_number : 1)).toFixed(2)}</Typography>
                    <BlockMath math="TPH = \frac{60\times60}{\text{Time for one full movement cycle (s)}}" />
                    <Typography>Total Time Spent 花費時間:{(time + relocate_time + (work_t * pick_number)).toFixed(2)} s </Typography>
                    <Typography>Total Time Spent on Workstation:{(work_t * pick_number).toFixed(2)} s </Typography>
                    <Typography>Total Time Spent on Transporting:{(time + relocate_time).toFixed(2)} s</Typography>
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
                    <Typography variant="h4" fontWeight='bold'>Recommended No. of Robot(s):{Math.ceil((((relocate_time + time / 2) / pick_number) - inboundclash_t) / work_t) * ws_number}</Typography>
                    <Typography>Estimated New TPH: {(((60 * 60) / ((relocate_time + time) / pick_number + work_t)) * Math.ceil((((relocate_time + time / 2) / pick_number) - inboundclash_t) / work_t) * ws_number).toFixed(2)} </Typography>
                    <div style={{ fontSize: '0.7em' }}>
                        <BlockMath math="TPH = \frac{60\times60}{\text{Time for one full movement cycle (s)}}\times \text{No. of Robots}\times\text{No. of Workstations}" />
                    </div>
                </Stack>
            </Paper>
        </Stack>

    );
}