import { useState, useEffect } from 'react';
import { createMantenimiento, updateMantenimiento, deleteMantenimiento } from '../services/mantenimiento.service.js';
import { getAllEquipos } from '../services/equipo.service.js';
import MantenimientoForm from '../components/MantenimientoForm.jsx';
import { 
    Container, Typography, Box, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, CircularProgress, Button, IconButton,
    TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';


const MantenimientoListPage = () => {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [total, setTotal] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [toEdit, setToEdit] = useState(null);

    const fetchMantenimientos = async () => {
        setLoading(true);
        try {
            const response = await getAllMantenimientos(page + 1, rowsPerPage);
            setMantenimientos(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error("No se pudieron cargar los mantenimientos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllEquipos(1, 1000).then(res => setEquipos(res.data));
    }, []);

    useEffect(() => {
        fetchMantenimientos();
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenForm = (mantenimiento = null) => {
        setToEdit(mantenimiento);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setToEdit(null);
    };

    const handleSave = async (data) => {
        try {
            if (toEdit) {
                await updateMantenimiento(toEdit.id, data);
            } else {
                await createMantenimiento(data);
            }
            fetchMantenimientos();
            handleCloseForm();
        } catch (error) {
            console.error("Error al guardar el mantenimiento", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
            try {
                await deleteMantenimiento(id);
                fetchMantenimientos();
            } catch (error) {
                console.error("Error al eliminar el mantenimiento", error);
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                    Gestión de Mantenimientos
                </Typography>
                <Button variant="contained" sx={{ color: 'white' }} onClick={() => handleOpenForm(null)}>
                    + Nuevo Mantenimiento
                </Button>
            </Box>
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Equipo</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Técnico</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                            ) : (
                                mantenimientos.map((mantenimiento) => (
                                    <TableRow hover key={mantenimiento.id}>
                                        <TableCell>{mantenimiento.equipo?.nombre || 'N/A'}</TableCell>
                                        <TableCell>{mantenimiento.tipoMantenimiento}</TableCell>
                                        <TableCell>{new Date(mantenimiento.fecha).toLocaleString()}</TableCell>
                                        <TableCell>{mantenimiento.tecnico?.nombre || 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpenForm(mantenimiento)} color="secondary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(mantenimiento.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </Paper>
            {formOpen && (
                <MantenimientoForm 
                    open={formOpen} 
                    onClose={handleCloseForm} 
                    onSave={handleSave} 
                    mantenimiento={toEdit} 
                    equipos={equipos}
                />
            )}
        </Container>
    );
};

export default MantenimientoListPage;