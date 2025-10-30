import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/usuario.service.js';
import UsuarioForm from '../components/UsuarioForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
    Container, Typography, Box, Paper, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, CircularProgress, Button, IconButton,
    TablePagination, Chip, Backdrop, Tooltip, Fade
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import toast from 'react-hot-toast';
import React from 'react';

const UsuarioListPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalUsers, setTotalUsers] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllUsers(page + 1, rowsPerPage);
            setUsuarios(response.data);
            setTotalUsers(response.total);
        } catch (err) {
            setError('Error al cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage]);

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

    const renderEmptyState = () => (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <InboxOutlinedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            <Typography variant="h6" color="text.secondary">No hay usuarios registrados</Typography>
            <Typography>Cree el primer usuario para comenzar a gestionar el personal.</Typography>
        </Box>
    );

    const renderTableContent = () => {
        if (loading) return <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>;
        if (error) return <TableRow><TableCell colSpan={5} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>;
        if (usuarios.length === 0) return <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>{renderEmptyState()}</TableCell></TableRow>;

        return usuarios.map((usuario, index) => (
            <Fade in={true} timeout={300 * (index + 1)} key={usuario.id}>
                <TableRow hover>
                    <TableCell sx={{ fontWeight: 500 }}>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.rol}</TableCell>
                    <TableCell><Chip label={usuario.estado} color={usuario.estado === 'ACTIVO' ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell align="right">
                        <Tooltip title="Editar"><IconButton onClick={() => handleOpenForm(usuario)} color="secondary" disabled={isSubmitting}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Desactivar"><IconButton onClick={() => handleOpenConfirm(usuario.id)} color="error" disabled={isSubmitting}><DeleteIcon /></IconButton></Tooltip>
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
                        Gestión de Usuarios
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Cree, edite y gestione las cuentas del personal técnico.
                    </Typography>
                </Box>
                <Button variant="contained" sx={{ color: 'white', width: { xs: '100%', sm: 'auto' } }} onClick={() => handleOpenForm(null)} startIcon={<AddIcon />}>
                    Nuevo Usuario
                </Button>
            </Box>
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: 'grey.100', fontWeight: 'bold' } }}>
                                <TableCell sx={{ minWidth: 200 }}>Nombre</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>Rol</TableCell>
                                <TableCell sx={{ minWidth: 100 }}>Estado</TableCell>
                                <TableCell sx={{ minWidth: 120 }} align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{renderTableContent()}</TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </Paper>
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
        </Container>
    );
};

export default UsuarioListPage;