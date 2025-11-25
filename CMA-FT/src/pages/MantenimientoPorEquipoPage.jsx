import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEquipoById, getMantenimientosByEquipoId } from '../services/equipo.service.js';
import { createMantenimiento, updateMantenimiento, deleteMantenimiento, deleteEvidencia } from '../services/mantenimiento.service.js';
import MantenimientoForm from '../components/MantenimientoForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import TableSkeleton from '../components/TableSkeleton';
import { 
    Container, Typography, Box, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    TablePagination, Backdrop, Tooltip, Fade, TextField, InputAdornment,
    Chip, Breadcrumbs, Link, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchMantenimientos = useCallback(async () => {
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
            // Store in localStorage
            localStorage.setItem(`mantenimientos_${equipoId}`, JSON.stringify(response.data));
        } catch {
            setError('Error al cargar los mantenimientos.');
            // Try loading from cache
            const cachedData = localStorage.getItem(`mantenimientos_${equipoId}`);
            if (cachedData) {
                setMantenimientos(JSON.parse(cachedData));
                toast('Mostrando datos en caché', { icon: '📦' });
            }
        } finally {
            setLoading(false);
        }
    }, [equipoId, page, rowsPerPage, equipo]);

    useEffect(() => {
        fetchMantenimientos();
    }, [fetchMantenimientos]);
    
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

    const handlePrint = () => {
        window.print();
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

    // Filter mantenimientos based on search
    const filteredMantenimientos = debouncedSearch
        ? mantenimientos.filter(m => 
            m.tipoMantenimiento.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            m.observaciones.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            m.tecnico?.nombre?.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : mantenimientos;

    const getTypeColor = (tipo) => {
        const lowercaseTipo = tipo.toLowerCase();
        if (lowercaseTipo.includes('correctivo')) return 'warning';
        if (lowercaseTipo.includes('preventivo')) return 'success';
        return 'info';
    };

    const renderEmptyState = () => (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">
                {debouncedSearch ? 'No se encontraron registros' : 'No hay registros'}
            </Typography>
            <Typography>
                {debouncedSearch 
                    ? 'Intente con otros términos de búsqueda.'
                    : 'Cree el primer registro de mantenimiento para este equipo.'}
            </Typography>
        </Box>
    );

    const renderTableContent = () => {
        if (loading) return <TableSkeleton rows={rowsPerPage} columns={5} />;
        if (error) return <TableRow><TableCell colSpan={5} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>;
        if (filteredMantenimientos.length === 0) return <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>{renderEmptyState()}</TableCell></TableRow>;

        return filteredMantenimientos.map((mantenimiento, index) => (
            <Fade in={true} timeout={150 + (index * 50)} key={mantenimiento.id}>
                <TableRow 
                    hover 
                    onClick={() => navigate(`/mantenimiento/${mantenimiento.id}`)} 
                    sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        }
                    }}
                >
                    <TableCell>
                        <Chip 
                            label={mantenimiento.tipoMantenimiento} 
                            color={getTypeColor(mantenimiento.tipoMantenimiento)}
                            size="small"
                        />
                    </TableCell>
                    <TableCell>{new Date(mantenimiento.fecha).toLocaleString()}</TableCell>
                    <TableCell>{mantenimiento.tecnico?.nombre || 'N/A'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                        {mantenimiento.observaciones}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()} className="no-print">
                        <Tooltip title="Editar"><IconButton onClick={(e) => { e.stopPropagation(); handleOpenForm(mantenimiento); }} color="secondary" disabled={isSubmitting}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Eliminar"><IconButton onClick={(e) => { e.stopPropagation(); handleOpenConfirmDeleteManto(mantenimiento.id); }} color="error" disabled={isSubmitting}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                </TableRow>
            </Fade>
        ));
    };

    return (
        <Container maxWidth="lg" className="print-container">
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isSubmitting}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Breadcrumbs */}
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                sx={{ mb: 2 }}
                className="no-print"
            >
                <Link 
                    underline="hover" 
                    color="inherit" 
                    href="/dashboard"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Inicio
                </Link>
                <Link underline="hover" color="inherit" href="/equipos">
                    Equipos
                </Link>
                <Typography color="text.primary">{equipo?.nombre || '...'}</Typography>
            </Breadcrumbs>

            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', sm: 'center' }, 
                mb: 3, 
                gap: 2 
            }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Gestión de Mantenimientos
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Para el equipo: {equipo?.nombre || '...'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }} className="no-print">
                    <Button 
                        variant="outlined" 
                        onClick={handlePrint} 
                        startIcon={<PrintIcon />}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        Imprimir
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ color: 'white', width: { xs: '100%', sm: 'auto' } }} 
                        onClick={() => handleOpenForm(null)} 
                        startIcon={<AddIcon />}
                    >
                        Nuevo Mantenimiento
                    </Button>
                </Box>
            </Box>

            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 3 }} className="no-print">
                <TextField
                    fullWidth
                    placeholder="Buscar por tipo, observaciones o técnico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
                {debouncedSearch && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Mostrando {filteredMantenimientos.length} resultado(s) para "{debouncedSearch}"
                    </Typography>
                )}
            </Paper>

            {/* Print Header */}
            <Box className="print-only" sx={{ display: 'none' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                    Historial de Mantenimientos - {equipo?.nombre}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    Generado: {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                    })}
                </Typography>
            </Box>

            {/* Table with horizontal scroll for all screen sizes */}
            <Fade in={true} timeout={300}>
                <Paper 
                    sx={{ 
                        width: '100%', 
                        overflow: 'hidden',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}
                >
                    <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 'none' } }}>
                        <Table stickyHeader size="medium">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 130, fontWeight: 'bold' }}>Tipo</TableCell>
                                    <TableCell sx={{ minWidth: 160, fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell sx={{ minWidth: 140, fontWeight: 'bold' }}>Técnico</TableCell>
                                    <TableCell sx={{ minWidth: 200, fontWeight: 'bold' }}>Observaciones</TableCell>
                                    <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }} align="right" className="no-print">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderTableContent()}
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
                        labelRowsPerPage="Por pág:"
                        className="no-print"
                        sx={{
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }
                        }}
                    />
                </Paper>
            </Fade>

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