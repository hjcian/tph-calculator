import { Backdrop } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';


export function LoadingCircle({color = '#dd5716'}) {
    return (
    <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
        <CircularProgress sx={{ color: color }} />
    </Backdrop>
    )
}
