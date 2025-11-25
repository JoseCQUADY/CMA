import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipos, createEquipo, updateEquipo, deleteEquipo, deleteManual } from '../services/equipo.service.js';
import EquipoForm from '../components/EquipoForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import TableSkeleton from '../components/TableSkeleton';
import { 
    Container, Typography, Box, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, TablePagination, Button, IconButton,
    Backdrop, Tooltip, Fade, TextField, InputAdornment, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import toast from 'react-hot-toast';
import React from 'react';

const EquipoListPage = () => {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalEquipos, setTotalEquipos] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [equipoToEdit, setEquipoToEdit] = useState(null);
    const [confirmDeleteEquipoOpen, setConfirmDeleteEquipoOpen] = useState(false);
    const [confirmDeleteManualOpen, setConfirmDeleteManualOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchEquipos = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllEquipos(page + 1, rowsPerPage, debouncedSearch);
            setEquipos(response.data);
            setTotalEquipos(response.total);
            // Store in localStorage for offline access
            localStorage.setItem('lastEquiposSearch', debouncedSearch);
            localStorage.setItem('lastEquiposData', JSON.stringify(response.data));
        } catch {
            setError('Error al cargar los equipos. Por favor, intente de nuevo.');
            // Try to load from localStorage
            const cachedData = localStorage.getItem('lastEquiposData');
            if (cachedData) {
                setEquipos(JSON.parse(cachedData));
                toast('Mostrando datos en caché', { icon: '📦' });
            }
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, debouncedSearch]);

    useEffect(() => {
        fetchEquipos();
    }, [fetchEquipos]);

    // Load last search term from localStorage on mount
    useEffect(() => {
        const lastSearch = localStorage.getItem('lastEquiposSearch');
        if (lastSearch) {
            setSearchTerm(lastSearch);
        }
    }, []);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRowClick = (id) => navigate(`/equipo/${id}`);
    const handleOpenForm = (equipo = null) => {
        setEquipoToEdit(equipo);
        setFormOpen(true);
    };
    const handleCloseForm = () => {
        if (isSubmitting) return;
        setFormOpen(false);
        setEquipoToEdit(null);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveEquipo = async (data, manualFile) => {
        setIsSubmitting(true);
        const toastId = toast.loading(equipoToEdit ? 'Actualizando equipo...' : 'Creando equipo...');
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if(data[key]) formData.append(key, data[key]);
            });
            if (manualFile) {
                formData.append('pdf', manualFile);
            }
            if (equipoToEdit) {
                await updateEquipo(equipoToEdit.id, formData);
            } else {
                await createEquipo(formData);
            }
            toast.success(equipoToEdit ? 'Equipo actualizado.' : 'Equipo creado.', { id: toastId });
            handleCloseForm();
            fetchEquipos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenConfirmDeleteEquipo = (id) => {
        setItemToDelete(id);
        setConfirmDeleteEquipoOpen(true);
    };
    const handleCloseConfirmDeleteEquipo = () => {
        setItemToDelete(null);
        setConfirmDeleteEquipoOpen(false);
    };
    const handleDeleteEquipo = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Eliminando equipo...');
        try {
            await deleteEquipo(itemToDelete);
            toast.success('Equipo eliminado.', { id: toastId });
            handleCloseConfirmDeleteEquipo();
            fetchEquipos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleOpenConfirmDeleteManual = (id) => {
        setItemToDelete(id);
        setConfirmDeleteManualOpen(true);
    };
    const handleCloseConfirmDeleteManual = () => {
        setItemToDelete(null);
        setConfirmDeleteManualOpen(false);
    };
    const handleDeleteManual = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Eliminando manual...');
        try {
            await deleteManual(itemToDelete);
            toast.success('Manual eliminado.', { id: toastId });
            handleCloseConfirmDeleteManual();
            handleCloseForm();
            fetchEquipos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderEmptyState = () => (
         <Box sx={{ p: 4, textAlign: 'center' }}>
            <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">
                {debouncedSearch ? 'No se encontraron equipos' : 'No hay equipos registrados'}
            </Typography>
            <Typography>
                {debouncedSearch 
                    ? 'Intente con otros términos de búsqueda.'
                    : 'Cree el primer equipo para comenzar a gestionar el inventario.'}
            </Typography>
        </Box>
    );

    const renderTableContent = () => {
        if (loading) return <TableSkeleton rows={rowsPerPage} columns={6} />;
        if (error) return <TableRow><TableCell colSpan={6} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>;
        if (equipos.length === 0) return <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}>{renderEmptyState()}</TableCell></TableRow>;

        return equipos.map((equipo, index) => (
            <Fade in={true} timeout={150 + (index * 50)} key={equipo.id}>
                <TableRow 
                    hover 
                    sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        }
                    }}
                >
                    <TableCell onClick={() => handleRowClick(equipo.id)} sx={{ fontWeight: 500 }}>{equipo.nombre}</TableCell>
                    <TableCell onClick={() => handleRowClick(equipo.id)}>{equipo.marca}</TableCell>
                    <TableCell onClick={() => handleRowClick(equipo.id)}>{equipo.modelo}</TableCell>
                    <TableCell onClick={() => handleRowClick(equipo.id)}>{equipo.numeroSerie}</TableCell>
                    <TableCell onClick={() => handleRowClick(equipo.id)}>{equipo.ubicacion}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()} className="no-print">
                        <Tooltip title="Editar"><IconButton onClick={(e) => { e.stopPropagation(); handleOpenForm(equipo); }} color="secondary" disabled={isSubmitting}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Eliminar"><IconButton onClick={(e) => { e.stopPropagation(); handleOpenConfirmDeleteEquipo(equipo.id); }} color="error" disabled={isSubmitting}><DeleteIcon /></IconButton></Tooltip>
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
                        Gestión de Equipos
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Cree, edite y gestione el inventario de equipos médicos.
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
                        Crear Equipo
                    </Button>
                </Box>
            </Box>

            {/* Search Bar */}
            <Paper sx={{ p: 2, mb: 3 }} className="no-print">
                <TextField
                    fullWidth
                    placeholder="Buscar por nombre, marca, modelo, número de serie, ID o ubicación..."
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
                        Mostrando {totalEquipos} resultado(s) para "{debouncedSearch}"
                    </Typography>
                )}
            </Paper>

            {/* Print Header - Only visible when printing */}
            <Box className="print-only" sx={{ display: 'none' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                    Reporte de Equipos Médicos
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    Fecha de generación: {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Typography>
            </Box>

            {/* Table with horizontal scroll for all screen sizes */}
            <Fade in={true} timeout={300}>
                <Paper 
                    sx={{ 
                        width: '100%', 
                        overflow: 'hidden', 
                        position: 'relative',
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}
                >
                    <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 'none' } }}>
                        <Table stickyHeader size="medium">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>Marca</TableCell>
                                    <TableCell sx={{ minWidth: 120, fontWeight: 'bold' }}>Modelo</TableCell>
                                    <TableCell sx={{ minWidth: 130, fontWeight: 'bold' }}>N/S</TableCell>
                                    <TableCell sx={{ minWidth: 140, fontWeight: 'bold' }}>Ubicación</TableCell>
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
                        count={totalEquipos}
                        rowsPerPage={rowsPerPage} 
                        page={page} 
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage} 
                        labelRowsPerPage="Filas:"
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
                <EquipoForm
                    open={formOpen} onClose={handleCloseForm} onSave={handleSaveEquipo}
                    equipo={equipoToEdit} onDeleteManual={handleOpenConfirmDeleteManual} isSubmitting={isSubmitting}
                />
            )}
            <ConfirmationDialog
                open={confirmDeleteEquipoOpen}
                onClose={handleCloseConfirmDeleteEquipo}
                onConfirm={handleDeleteEquipo}
                title="Confirmar Eliminación de Equipo"
                message="¿Está seguro de que desea eliminar este equipo? Esta acción marcará el equipo como inactivo y no se podrá deshacer."
            />
            <ConfirmationDialog
                open={confirmDeleteManualOpen}
                onClose={handleCloseConfirmDeleteManual}
                onConfirm={handleDeleteManual}
                title="Confirmar Eliminación de Manual"
                message="¿Está seguro de que desea eliminar el manual asociado a este equipo? Esta acción no se puede deshacer."
            />
        </Container>
    );
};

export default EquipoListPage;