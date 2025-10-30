import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../schemas/auth.schema';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Container, Box, Typography, TextField, Button, CircularProgress, 
    Grid, Paper, Avatar, Fade
} from '@mui/material';
import toast from 'react-hot-toast';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import logo from '../assets/logo.svg';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
            toast.success('Inicio de sesión exitoso.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al iniciar sesión.';
            setServerError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    p: 4,
                }}
            >
                <img src={logo} alt="Logo" style={{ height: '80px', width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: '16px' }} />
                <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
                    Sistema de Bitácora de Mantenimiento
                </Typography>
            </Grid>
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Fade in={true} timeout={1000}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Iniciar Sesión
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                            {serverError && <Typography color="error" align="center" sx={{ mb: 2 }}>{serverError}</Typography>}
                            <TextField
                                {...register('email')}
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Correo Electrónico"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                            <TextField
                                {...register('password')}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, color: 'white', py: 1.5 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Acceder'}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Grid>
        </Grid>
    );
};

export default LoginPage;