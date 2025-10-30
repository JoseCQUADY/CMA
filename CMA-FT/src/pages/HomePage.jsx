import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipos } from '../services/equipo.service.js';
import { 
    Container, Typography, Box, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, TablePagination, CircularProgress 
} from '@mui/material';
import React from 'react';


const HomePage = () => {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalEquipos, setTotalEquipos] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEquipos = async () => {
            setLoading(true);
            try {
                const response = await getAllEquipos(page + 1, rowsPerPage);
                setEquipos(response.data);
                setTotalEquipos(response.total);
            } catch (error) {
                console.error("No se pudieron cargar los equipos");
            } finally {
                setLoading(false);
            }
        };
        fetchEquipos();
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRowClick = (id) => {
        navigate(`/equipo/${id}`);
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
                Inventario de Equipos Médicos
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="tabla de equipos">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Marca</TableCell>
                                <TableCell>Modelo</TableCell>
                                <TableCell>N/S</TableCell>
                                <TableCell>Ubicación</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                equipos.map((equipo) => (
                                    <TableRow
                                        hover
                                        key={equipo.id}
                                        onClick={() => handleRowClick(equipo.id)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{equipo.nombre}</TableCell>
                                        <TableCell>{equipo.marca}</TableCell>
                                        <TableCell>{equipo.modelo}</TableCell>
                                        <TableCell>{equipo.numeroSerie}</TableCell>
                                        <TableCell>{equipo.ubicacion}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalEquipos}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Container>
    );
};

export default HomePage;