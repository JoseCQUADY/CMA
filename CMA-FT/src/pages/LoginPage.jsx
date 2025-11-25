import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../schemas/auth.schema';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Container, Box, Typography, TextField, Button, CircularProgress, 
    Grid, Paper, Avatar, Fade, useMediaQuery, InputAdornment, IconButton,
    Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import logo from '../assets/logo.svg';
import { getLocalStorage, setLocalStorage } from '../utils/cookie.js';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberEmail, setRememberEmail] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
        resolver: yupResolver(loginSchema),
    });

    // Load remembered email on mount
    useEffect(() => {
        const savedEmail = getLocalStorage('rememberedEmail');
        if (savedEmail) {
            setValue('email', savedEmail);
            setRememberEmail(true);
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        setServerError('');
        try {
            // Save email if remember is checked
            if (rememberEmail) {
                setLocalStorage('rememberedEmail', data.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            await login(data.email, data.password);
            navigate('/dashboard');
            toast.success('Inicio de sesión exitoso.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al iniciar sesión.';
            setServerError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleTogglePassword = () => setShowPassword(!showPassword);

    return (
        <Grid container component="main" sx={{ minHeight: '100vh' }}>
            {/* Left Side - Branding (Hidden on mobile) */}
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
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -150,
                        left: -150,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <img 
                        src={logo} 
                        alt="Logo" 
                        style={{ 
                            height: isMobile ? '60px' : '80px', 
                            width: 'auto', 
                            filter: 'brightness(0) invert(1)', 
                            marginBottom: '24px' 
                        }} 
                    />
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                        Sistema de Bitácora de Mantenimiento
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 400 }}>
                        Gestione el inventario de equipos médicos y lleve un registro detallado 
                        de todos los mantenimientos realizados.
                    </Typography>
                </Box>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid 
                item 
                xs={12} 
                sm={8} 
                md={5} 
                component={Paper} 
                elevation={6} 
                square
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <Fade in={true} timeout={1000}>
                    <Box
                        sx={{
                            my: { xs: 4, sm: 8 },
                            mx: { xs: 2, sm: 4 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {/* Mobile Logo */}
                        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3, textAlign: 'center' }}>
                            <img 
                                src={logo} 
                                alt="Logo" 
                                style={{ height: '50px', width: 'auto', marginBottom: '16px' }} 
                            />
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                Sistema de Bitácora
                            </Typography>
                        </Box>

                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
                            Iniciar Sesión
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
                            Ingrese sus credenciales para acceder al sistema
                        </Typography>

                        <Box 
                            component="form" 
                            noValidate 
                            onSubmit={handleSubmit(onSubmit)} 
                            sx={{ width: '100%', maxWidth: 400 }}
                        >
                            {serverError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {serverError}
                                </Alert>
                            )}

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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                            <TextField
                                {...register('password')}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 3, 
                                    mb: 2, 
                                    color: 'white', 
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Acceder al Sistema'
                                )}
                            </Button>
                        </Box>

                        {/* Footer */}
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ mt: 4, textAlign: 'center' }}
                        >
                            © {new Date().getFullYear()} Sistema de Bitácora de Mantenimiento
                        </Typography>
                    </Box>
                </Fade>
            </Grid>
        </Grid>
    );
};

export default LoginPage;