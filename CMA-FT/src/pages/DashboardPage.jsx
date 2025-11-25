import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, Skeleton, useMediaQuery, Fade, Grow } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, alpha } from '@mui/material/styles';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildIcon from '@mui/icons-material/Build';
import { getLocalStorage, setLocalStorage } from '../utils/cookie.js';
import { getSystemStats } from '../services/stats.service.js';

const DashboardCard = ({ title, description, link, icon, disabled = false, stats, index = 0, loading = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (disabled) {
        return null;
    }

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Grow in={!loading} timeout={400 + (index * 100)}>
                <Paper
                    component={Link}
                    to={link}
                    elevation={0}
                    sx={{
                        p: { xs: 2.5, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textDecoration: 'none',
                        height: '100%',
                        minHeight: { xs: 140, sm: 160 },
                        color: 'inherit',
                        backgroundColor: 'background.paper',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8],
                            borderColor: 'primary.main',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2 }}>
                        <Avatar 
                            sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main',
                                width: { xs: 48, sm: 56 }, 
                                height: { xs: 48, sm: 56 }, 
                                mr: 2 
                            }}
                        >
                        {icon}
                    </Avatar>
                    {stats !== undefined && (
                        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {loading ? <Skeleton width={40} /> : stats}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                registros
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant={isMobile ? 'subtitle1' : 'h6'} component="h3" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {description}
                    </Typography>
                </Box>
            </Paper>
            </Grow>
        </Grid>
    );
};

const StatCard = ({ title, value, icon, color = 'primary.main', loading = false, index = 0 }) => {
    const theme = useTheme();
    
    return (
        <Fade in={true} timeout={300 + (index * 100)}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    alignItems: 'center',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: 4,
                    borderLeftColor: color,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                    },
                }}
            >
                <Avatar 
                    sx={{ 
                        bgcolor: alpha(theme.palette.mode === 'dark' ? theme.palette.primary.light : color, 0.1), 
                        color: color,
                        mr: 2 
                    }}
                >
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {loading ? <Skeleton width={40} animation="wave" /> : value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                </Box>
            </Paper>
        </Fade>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [lastVisit, setLastVisit] = useState(null);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        // Track last visit using localStorage
        const storedLastVisit = getLocalStorage('lastDashboardVisit');
        if (storedLastVisit) {
            setLastVisit(new Date(storedLastVisit));
        }
        setLocalStorage('lastDashboardVisit', new Date().toISOString());
        
        // Fetch stats using AJAX + JSON
        const fetchStats = async () => {
            try {
                const response = await getSystemStats();
                setStats(response.data);
                // Cache stats in localStorage
                setLocalStorage('dashboardStats', response.data);
            } catch {
                // Load from cache if API fails
                const cached = getLocalStorage('dashboardStats');
                if (cached) {
                    setStats(cached);
                }
            } finally {
                setLoadingStats(false);
            }
        };
        
        fetchStats();
    }, []);

    return (
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
            {/* Welcome Banner */}
            <Fade in={true} timeout={400}>
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        p: { xs: 2.5, sm: 3, md: 4 },
                        borderRadius: 2,
                        background: (theme) => 
                            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography 
                            variant={isMobile ? 'h5' : 'h4'} 
                            component="h1" 
                            sx={{ fontWeight: 700 }}
                        >
                            Bienvenido de nuevo, {user?.nombre}
                        </Typography>
                        <Typography 
                            variant={isMobile ? 'body2' : 'subtitle1'} 
                            sx={{ mt: 1, opacity: 0.9 }}
                        >
                            Seleccione una de las siguientes opciones para comenzar.
                        </Typography>
                        {lastVisit && (
                            <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.7 }}>
                                Última visita: {lastVisit.toLocaleDateString('es-ES', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        )}
                    </Box>
                    {/* Decorative elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            right: -50,
                            top: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            display: { xs: 'none', md: 'block' }
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 100,
                            bottom: -80,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            display: { xs: 'none', md: 'block' }
                        }}
                    />
                </Paper>
            </Fade>

            {/* Quick Stats */}
            <Fade in={!loadingStats} timeout={500}>
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Estadísticas del Sistema
                    </Typography>
                </Box>
            </Fade>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <StatCard 
                        title="Equipos Activos" 
                        value={stats?.equipos_activos ?? '-'} 
                        icon={<DevicesIcon />}
                        color="primary.main"
                        loading={loadingStats}
                        index={0}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard 
                        title="Usuarios Activos" 
                        value={stats?.usuarios_activos ?? '-'} 
                        icon={<PeopleIcon />}
                        color="secondary.main"
                        loading={loadingStats}
                        index={1}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard 
                        title="Mantenimientos (Mes)" 
                        value={stats?.mantenimientos_mes ?? '-'} 
                        icon={<BuildIcon />}
                        color="success.main"
                        loading={loadingStats}
                        index={2}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard 
                        title="Total Mantenimientos" 
                        value={stats?.total_mantenimientos ?? '-'} 
                        icon={<TrendingUpIcon />}
                        color="info.main"
                        loading={loadingStats}
                        index={3}
                    />
                </Grid>
            </Grid>
            
            {/* Main Navigation Cards */}
            <Fade in={!loadingStats} timeout={600}>
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Accesos Rápidos
                    </Typography>
                </Box>
            </Fade>
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'stretch' }}>
                <DashboardCard
                    title="Gestionar Equipos"
                    description="Ver, crear, editar y eliminar el inventario de equipos médicos."
                    link="/equipos"
                    icon={<DevicesIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />}
                    stats={stats?.equipos_activos}
                    loading={loadingStats}
                    index={0}
                />
                
                <DashboardCard
                    title="Gestionar Usuarios"
                    description="Ver, crear, editar y eliminar las cuentas del personal médico."
                    link="/admin/usuarios"
                    icon={<PeopleIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />}
                    disabled={user?.rol !== 'ADMIN'}
                    stats={stats?.usuarios_activos}
                    loading={loadingStats}
                    index={1}
                />
            </Grid>

            {/* Info Section */}
            <Fade in={true} timeout={800}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        mt: 4, 
                        p: { xs: 2, sm: 3 }, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) => 
                            theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.grey[50], 1),
                    }}
                >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        Sistema de Bitácora de Mantenimiento
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Este sistema le permite gestionar el inventario de equipos médicos y llevar un registro 
                        detallado de todos los mantenimientos realizados. Utilice los accesos rápidos superiores 
                        para navegar entre las diferentes secciones.
                    </Typography>
                </Paper>
            </Fade>
        </Box>
    );
};

export default DashboardPage;