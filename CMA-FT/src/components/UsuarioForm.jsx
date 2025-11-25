import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserSchema, updateUserSchema } from '../schemas/usuario.schema';
import { 
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, 
    FormControl, InputLabel, Select, MenuItem, Box, CircularProgress, Typography,
    useMediaQuery, Grid, InputAdornment, Divider, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import React from 'react';

const UsuarioForm = ({ open, onClose, onSave, usuario, isSubmitting }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
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
        <Dialog 
            open={open} 
            onClose={onClose} 
            disableEscapeKeyDown={isSubmitting}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {usuario ? 'Modifique los datos del usuario' : 'Complete los datos del nuevo usuario'}
                </Typography>
            </DialogTitle>
            <Divider />
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                {...register('nombre')}
                                label="Nombre Completo"
                                fullWidth
                                required
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                {...register('email')}
                                label="Correo Electrónico"
                                type="email"
                                fullWidth
                                required
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                {...register('password')}
                                label="Contraseña"
                                type="password"
                                helperText={usuario ? errors.password?.message || 'Dejar en blanco para no cambiar' : errors.password?.message}
                                fullWidth
                                required={!usuario}
                                error={!!errors.password}
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <BadgeIcon color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Rol del Usuario
                                    </Typography>
                                </Box>
                                <FormControl fullWidth error={!!errors.rol} disabled={isSubmitting}>
                                    <InputLabel id="rol-select-label">Rol</InputLabel>
                                    <Select
                                        {...register('rol')}
                                        labelId="rol-select-label"
                                        defaultValue={usuario?.rol || 'TECNICO'}
                                        label="Rol"
                                    >
                                        <MenuItem value="TECNICO">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>Técnico</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    - Acceso limitado
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="ADMIN">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>Administrador</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    - Acceso completo
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                    {errors.rol && (
                                        <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                                            {errors.rol.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 2 }}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={isSubmitting}
                        sx={{ borderRadius: 2, minWidth: 120, color: 'white' }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default UsuarioForm;