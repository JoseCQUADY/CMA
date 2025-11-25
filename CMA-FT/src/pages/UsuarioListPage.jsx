import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/usuario.service.js';
import UsuarioForm from '../components/UsuarioForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import TableSkeleton from '../components/TableSkeleton';
import { 
    Box, Typography, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Button, IconButton,
    TablePagination, Chip, Backdrop, Tooltip, Fade, TextField, InputAdornment,
    Avatar, CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import toast from 'react-hot-toast';
import React from 'react';

const UsuarioListPage = () => {
    const theme = useTheme();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllUsers(page + 1, rowsPerPage, debouncedSearch);
            setUsuarios(response.data);
            setTotalUsers(response.total);
            // Store in localStorage for offline access
            localStorage.setItem('lastUsersData', JSON.stringify(response.data));
        } catch {
            setError('Error al cargar los usuarios.');
            // Try to load from localStorage
            const cachedData = localStorage.getItem('lastUsersData');
            if (cachedData) {
                setUsuarios(JSON.parse(cachedData));
                toast('Mostrando datos en caché', { icon: '📦' });
            }
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenForm = (user = null) => {
        setUserToEdit(user);
        setFormOpen(true);
    };
    const handleCloseForm = () => {
        if (isSubmitting) return;
        setFormOpen(false);
        setUserToEdit(null);
    };

    const handleOpenConfirm = (id) => {
        setItemToDelete(id);
        setConfirmOpen(true);
    };
    const handleCloseConfirm = () => {
        setItemToDelete(null);
        setConfirmOpen(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveUser = async (data) => {
        setIsSubmitting(true);
        const toastId = toast.loading(userToEdit ? 'Actualizando usuario...' : 'Creando usuario...');
        try {
            if (userToEdit) {
                await updateUser(userToEdit.id, data);
            } else {
                await createUser(data);
            }
            toast.success(userToEdit ? 'Usuario actualizado.' : 'Usuario creado.', { id: toastId });
            handleCloseForm();
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Desactivando usuario...');
        try {
            await deleteUser(itemToDelete);
            toast.success('Usuario desactivado.', { id: toastId });
            handleCloseConfirm();
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al desactivar.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const renderEmptyState = () => (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">
                {debouncedSearch ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </Typography>
            <Typography>
                {debouncedSearch 
                    ? 'Intente con otros términos de búsqueda.'
                    : 'Cree el primer usuario para comenzar a gestionar el personal.'}
            </Typography>
        </Box>
    );

    const renderTableContent = () => {
        if (loading) return <TableSkeleton rows={rowsPerPage} columns={5} />;
        if (error) return <TableRow><TableCell colSpan={5} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>;
        if (usuarios.length === 0) return <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>{renderEmptyState()}</TableCell></TableRow>;

        return usuarios.map((usuario, index) => (
            <Fade in={true} timeout={150 + (index * 50)} key={usuario.id}>
                <TableRow hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: usuario.rol === 'ADMIN' ? 'secondary.main' : 'primary.main' }}>
                                {usuario.rol === 'ADMIN' ? <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> : getInitials(usuario.nombre)}
                            </Avatar>
                            {usuario.nombre}
                        </Box>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                        <Chip 
                            label={usuario.rol} 
                            color={usuario.rol === 'ADMIN' ? 'secondary' : 'default'}
                            size="small"
                        />
                    </TableCell>
                    <TableCell><Chip label={usuario.estado} color={usuario.estado === 'ACTIVO' ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell align="right" className="no-print">
                        <Tooltip title="Editar"><IconButton onClick={() => handleOpenForm(usuario)} color="secondary" disabled={isSubmitting}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Desactivar"><IconButton onClick={() => handleOpenConfirm(usuario.id)} color="error" disabled={isSubmitting}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                </TableRow>
            </Fade>
        ));
    };

    return (
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }} className="print-container">
            <Backdrop sx={{ color: '#fff', zIndex: (th) => th.zIndex.drawer + 1 }} open={isSubmitting}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Header Section */}
            <Fade in={true} timeout={300}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'center' }, 
                    mb: 3, 
                    gap: 2 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                display: { xs: 'none', sm: 'flex' },
                            }}
                        >
                            <PeopleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                                Gestión de Usuarios
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cree, edite y gestione las cuentas del personal técnico.
                            </Typography>
                        </Box>
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
                            Nuevo Usuario
                        </Button>
                    </Box>
                </Box>
            </Fade>

            {/* Search Bar */}
            <Fade in={true} timeout={400}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 2, 
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                    }} 
                    className="no-print"
                >
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre, email o rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                            }
                        }}
                    />
                    {debouncedSearch && (
                        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={`${totalUsers} resultado(s)`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                            />
                            <Typography variant="body2" color="text.secondary">
                                para "{debouncedSearch}"
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Fade>

            {/* Print Header - Only visible when printing */}
            <Box className="print-only" sx={{ display: 'none' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                    Reporte de Usuarios del Sistema
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
            <Fade in={!loading} timeout={500}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        width: '100%', 
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        transition: 'box-shadow 0.3s ease-in-out',
                    }}
                >
                    <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 600 }}>Nombre</TableCell>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 600 }}>Email</TableCell>
                                    <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>Rol</TableCell>
                                    <TableCell sx={{ minWidth: 90, fontWeight: 600 }}>Estado</TableCell>
                                    <TableCell sx={{ minWidth: 100, fontWeight: 600 }} align="right" className="no-print">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>{renderTableContent()}</TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={totalUsers}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Por pág:"
                        className="no-print"
                        sx={{
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }
                        }}
                    />
                </Paper>
            </Fade>

            {formOpen && (
                <UsuarioForm open={formOpen} onClose={handleCloseForm} onSave={handleSaveUser} usuario={userToEdit} isSubmitting={isSubmitting} />
            )}
            <ConfirmationDialog
                open={confirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleDeleteUser}
                title="Confirmar Desactivación"
                message="¿Está seguro de que desea desactivar esta cuenta de usuario?"
            />
        </Box>
    );
};

export default UsuarioListPage;