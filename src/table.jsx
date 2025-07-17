import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Table, TableBody, TableHead, TableCell, TableContainer, TableFooter, TablePagination, TableRow, IconButton, Typography, Button } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import DeleteIcon from '@mui/icons-material/Delete';

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

export default function StorageTable({ storage, onDelete, onDeleteAll }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const safeStorage = Array.isArray(storage) ? storage : [];

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - safeStorage.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedStorage =
        rowsPerPage > 0
            ? safeStorage.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : safeStorage;

    return (
        <TableContainer sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
            <Table aria-label="Storage Table" sx={{ minWidth: 500 }}>
                <TableHead sx={{ backgroundColor: "#ccc" }}>
                    <TableRow>
                        <TableCell align="center"><Typography sx={{ fontWeight: 700 }}>#</Typography></TableCell>
                        <TableCell align="center"><Typography sx={{ fontWeight: 700 }}>x</Typography></TableCell>
                        <TableCell align="center"><Typography sx={{ fontWeight: 700 }}>y</Typography></TableCell>
                        <TableCell align="center"><Typography sx={{ fontWeight: 700 }}>z</Typography></TableCell>
                        <TableCell align="center"><Typography>
                            <Button type="button" variant="contained" disableElevation onClick={onDeleteAll}
                                sx={{
                                    backgroundColor: '#D2042D',
                                    fontSize: '0.75rem', 
                                    padding: '4px 8px',  
                                    minWidth: 'auto',    
                                    borderRadius: 0,
                                }}
                            >
                                Delete All </Button></Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedStorage.map((item, index) => (
                        <TableRow key={page * rowsPerPage + index}>
                            <TableCell align="center" sx={{ backgroundColor: "#e8e9eb", width: 60, fontWeight: 700 }}>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell align="center" sx={{ width: 220 }}>{item.x}</TableCell>
                            <TableCell align="center" sx={{ width: 220 }}>{item.y}</TableCell>
                            <TableCell align="center" sx={{ width: 220 }}>{item.z}</TableCell>
                            <TableCell align="center" sx={{ width: 60 }}>
                                <IconButton onClick={() => onDelete(page * rowsPerPage + index)}><DeleteIcon sx={{ color: "#D2042D" }} /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={4} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            count={safeStorage.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                            colSpan={4}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
}