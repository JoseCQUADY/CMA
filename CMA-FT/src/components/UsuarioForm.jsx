import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserSchema, updateUserSchema } from '../schemas/usuario.schema';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, CircularProgress,Typography } from '@mui/material';
import React from 'react';

const UsuarioForm = ({ open, onClose, onSave, usuario, isSubmitting }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(usuario ? updateUserSchema : createUserSchema),
    });

    useEffect(() => {
        if (open) {
            if (usuario) {
                reset({ ...usuario, password: '' });
            } else {
                reset({ nombre: '', email: '', password: '', rol: 'TECNICO' });
            }
        }
    }, [usuario, open, reset]);

    const onSubmit = (data) => {
        const dataToSave = { ...data };
        if (usuario && !dataToSave.password) {
            delete dataToSave.password;
        }
        onSave(dataToSave);
    };

    return (
        <Dialog open={open} onClose={onClose} disableEscapeKeyDown={isSubmitting}>

            <DialogTitle> <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </Typography></DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <TextField
                        {...register('nombre')}
                        label="Nombre Completo"
                        fullWidth
                        margin="dense"
                        required
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        disabled={isSubmitting}
                    />
                    <TextField
                        {...register('email')}
                        label="Correo Electrónico"
                        type="email"
                        fullWidth
                        margin="dense"
                        required
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        disabled={isSubmitting}
                    />
                    <TextField
                        {...register('password')}
                        label="Contraseña"
                        type="password"
                        helperText={usuario ? 'Dejar en blanco para no cambiar' : errors.password?.message}
                        fullWidth
                        margin="dense"
                        required={!usuario}
                        error={!!errors.password}
                        disabled={isSubmitting}
                    />
                    <FormControl fullWidth margin="dense" error={!!errors.rol} disabled={isSubmitting}>
                        <InputLabel id="rol-select-label">Rol</InputLabel>
                        <Select
                            {...register('rol')}
                            labelId="rol-select-label"
                            defaultValue={usuario?.rol || 'TECNICO'}
                            label="Rol"
                        >
                            <MenuItem value="TECNICO">Técnico</MenuItem>
                            <MenuItem value="ADMIN">Administrador</MenuItem>
                        </Select>
                        {errors.rol && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.rol.message}</p>}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default UsuarioForm;