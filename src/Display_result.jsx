import { Stack, Typography, Divider, Paper } from "@mui/material";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export function display_result(length, breadth, height, work_t, time, relocate_time, error, storage, pick_number) {

    return (
        <Stack direction={'row'} gap={1}>
            <Paper flex={7} elevation={0} style={{
                backgroundColor: "lightgreen", borderColor: "#fcfdfb",
                borderWidth: 2, padding: 20, width: '100%', border: '1px solid #ccc'
            }}
            >
                <Stack display="flex" alignItems={'center'} direction={'column'} gap={1} >
                    <Typography variant="h4" fontWeight='bold'>Throughput Per Hour (TPH)：{((60 * 60) / ((relocate_time + time * 2) / pick_number + work_t)).toFixed(2)}</Typography>
                    <BlockMath math="TPH = \frac{60*60}{\text{Time for one full movement cycle}}" />
                    <Typography>Total Time Spent 花費時間：{((time * 2) + relocate_time + (work_t * pick_number)).toFixed(2)} s </Typography>
                    <Typography>Total Time Spent on Workstation：{(work_t * pick_number).toFixed(2)} s </Typography>
                    <Typography>Total Time Spent on Transporting：{((time * 2) + relocate_time).toFixed(2)} s</Typography>
                    <Divider orientation="horizontal" flexItem />
                    <Typography> Maximum Storage Capacity 貨架數量：{length * breadth * height} units</Typography>
                    <Typography>No. of Container 膠箱數量：{storage.length} units</Typography>
                    <Divider orientation="horizontal" flexItem />
                    <Typography>Average Time Spent relocating for each container：{(relocate_time / (pick_number)).toFixed(2)} s</Typography>
                    <Typography>Average Time Spent Inbound & Outbound for each container：{(time * 2 / (pick_number)).toFixed(2)} s</Typography>
                    <Typography>Average Time Spent for each container：{((relocate_time + time * 2) / pick_number + work_t).toFixed(2)} s</Typography>
                </Stack>
            </Paper>
            <Paper elevation={0} flex={3} style={{
                backgroundColor: "white", borderColor: "lightgray",
                borderWidth: 1, padding: 20, width: '100%', border: '1px solid #ccc'
            }}>
                <Stack display="flex" alignItems={'center'} direction={'column'} gap={1} >
                    <Typography variant="h4" fontWeight='bold'>Recommended No. of Robot(s)：{Math.ceil(((relocate_time + time * 2) / pick_number)/work_t)}</Typography>

                </Stack>
            </Paper>
        </Stack>

    );
}