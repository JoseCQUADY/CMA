import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEquipoById, getMantenimientosByEquipoId } from '../services/equipo.service.js';
import { createMantenimiento, updateMantenimiento, deleteMantenimiento, deleteEvidencia } from '../services/mantenimiento.service.js';
import MantenimientoForm from '../components/MantenimientoForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
    Container, Typography, Box, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, CircularProgress, Button, IconButton,
    TablePagination, Backdrop, Tooltip, Fade
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import toast from 'react-hot-toast';
import React from 'react';

const MantenimientoPorEquipoPage = () => {
    const { id: equipoId } = useParams();
    const navigate = useNavigate();
    const [equipo, setEquipo] = useState(null);
    const [mantenimientos, setMantenimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [total, setTotal] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [toEdit, setToEdit] = useState(null);
    const [confirmDeleteMantoOpen, setConfirmDeleteMantoOpen] = useState(false);
    const [confirmDeleteEvidenciaOpen, setConfirmDeleteEvidenciaOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    const fetchMantenimientos = async () => {
        setLoading(true);
        setError('');
        try {
            if (!equipo) {
                const equipoData = await getEquipoById(equipoId);
                setEquipo(equipoData);
            }
            const response = await getMantenimientosByEquipoId(equipoId, page + 1, rowsPerPage);
            setMantenimientos(response.data);
            setTotal(response.total);
        } catch (err) {
            setError('Error al cargar los mantenimientos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMantenimientos();
    }, [equipoId, page, rowsPerPage]);
    
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
        if (isSubmitting) return;
        setFormOpen(false);
        setToEdit(null);
    };

    const handleOpenConfirmDeleteManto = (id) => {
        setItemToDelete(id);
        setConfirmDeleteMantoOpen(true);
    };
    const handleCloseConfirmDeleteManto = () => {
        setItemToDelete(null);
        setConfirmDeleteMantoOpen(false);
    };

    const handleOpenConfirmDeleteEvidencia = (id) => {
        setItemToDelete(id);
        setConfirmDeleteEvidenciaOpen(true);
    };
    const handleCloseConfirmDeleteEvidencia = () => {
        setItemToDelete(null);
        setConfirmDeleteEvidenciaOpen(false);
    };

    const handleSave = async (data, evidenciaFile) => {
        setIsSubmitting(true);
        const toastId = toast.loading(toEdit ? 'Actualizando...' : 'Creando...');
        try {
            const formData = new FormData();
            
            formData.append('tipoMantenimiento', data.tipoMantenimiento);
            formData.append('fecha', new Date(data.fecha).toISOString());
            formData.append('observaciones', data.observaciones);
            
            if (data.fechaProximoManto) {
                formData.append('fechaProximoManto', new Date(data.fechaProximoManto).toISOString());
            }

            if (evidenciaFile) {
                formData.append('evidencia', evidenciaFile);
            }

            if (toEdit) {
                await updateMantenimiento(toEdit.id, formData);
            } else {
                formData.append('equipoId', equipoId);
                await createMantenimiento(formData);
            }
            
            toast.success(toEdit ? 'Mantenimiento actualizado.' : 'Mantenimiento creado.', { id: toastId });
            handleCloseForm();
            fetchMantenimientos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Eliminando...');
        try {
            await deleteMantenimiento(itemToDelete);
            toast.success('Registro eliminado.', { id: toastId });
            handleCloseConfirmDeleteManto();
            fetchMantenimientos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvidencia = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Eliminando evidencia...');
        try {
            await deleteEvidencia(itemToDelete);
            toast.success('Evidencia eliminada.', { id: toastId });
            handleCloseConfirmDeleteEvidencia();
            handleCloseForm();
            fetchMantenimientos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar la evidencia.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderEmptyState = () => (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">No hay registros</Typography>
            <Typography>Cree el primer registro de mantenimiento para este equipo.</Typography>
        </Box>
    );

    const renderTableContent = () => {
        if (loading) return <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>;
        if (error) return <TableRow><TableCell colSpan={5} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>;
        if (mantenimientos.length === 0) return <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>{renderEmptyState()}</TableCell></TableRow>;

        return mantenimientos.map((mantenimiento, index) => (
            <Fade in={true} timeout={300 * (index + 1)} key={mantenimiento.id}>
                <TableRow hover onClick={() => navigate(`/mantenimiento/${mantenimiento.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{mantenimiento.tipoMantenimiento}</TableCell>
                    <TableCell>{new Date(mantenimiento.fecha).toLocaleString()}</TableCell>
                    <TableCell>{mantenimiento.tecnico?.nombre || 'N/A'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mantenimiento.observaciones}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Editar"><IconButton onClick={(e) => { e.stopPropagation(); handleOpenForm(mantenimiento); }} color="secondary" disabled={isSubmitting}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Eliminar"><IconButton onClick={(e) => { e.stopPropagation(); handleOpenConfirmDeleteManto(mantenimiento.id); }} color="error" disabled={isSubmitting}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                </TableRow>
            </Fade>
        ));
    };

    return (
        <Container maxWidth="lg">
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isSubmitting}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Gestión de Mantenimientos
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Para el equipo: {equipo?.nombre || '...'}
                    </Typography>
                </Box>
                <Button variant="contained" sx={{ color: 'white', width: { xs: '100%', sm: 'auto' } }} onClick={() => handleOpenForm(null)} startIcon={<AddIcon />}>
                    Nuevo Mantenimiento
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                             <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: 'grey.100', fontWeight: 'bold' } }}>
                                <TableCell sx={{ minWidth: 150 }}>Tipo</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Fecha</TableCell>
                                <TableCell sx={{ minWidth: 170 }}>Técnico</TableCell>
                                <TableCell sx={{ minWidth: 300 }}>Observaciones</TableCell>
                                <TableCell sx={{ minWidth: 120 }} align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {renderTableContent()}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]} component="div" count={total}
                    rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Filas por página:"
                />
            </Paper>

            {formOpen && (
                <MantenimientoForm 
                    open={formOpen} onClose={handleCloseForm} onSave={handleSave} 
                    mantenimiento={toEdit} onDeleteEvidencia={handleOpenConfirmDeleteEvidencia} isSubmitting={isSubmitting}
                />
            )}
            <ConfirmationDialog open={confirmDeleteMantoOpen} onClose={handleCloseConfirmDeleteManto} onConfirm={handleDelete} title="Confirmar Eliminación" message="¿Está seguro de que desea eliminar este registro de mantenimiento?" />
            <ConfirmationDialog open={confirmDeleteEvidenciaOpen} onClose={handleCloseConfirmDeleteEvidencia} onConfirm={handleDeleteEvidencia} title="Confirmar Eliminación de Evidencia" message="¿Está seguro de que desea eliminar el archivo de evidencia?" />
        </Container>
    );
};

export default MantenimientoPorEquipoPage;