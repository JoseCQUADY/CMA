import React from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';

const DashboardCard = ({ title, description, link, icon, disabled = false }) => {
    if (disabled) {
        return null;
    }

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Paper
                component={Link}
                to={link}
                elevation={2}
                sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textDecoration: 'none',
                    height: '100%',
                    color: 'inherit',
                    backgroundColor: 'background.paper',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                        borderColor: 'primary.main',
                    },
                }}
            >
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                    {icon}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {description}
                    </Typography>
                </Box>
            </Paper>
        </Grid>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg">
            <Box
                component={Paper}
                elevation={2}
                sx={{
                    mb: 5,
                    p: { xs: 3, md: 4 },
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    color: 'white',
                }}
            >
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Bienvenido de nuevo, {user?.nombre}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, color: 'grey.300' }}>
                    Seleccione una de las siguientes opciones para comenzar.
                </Typography>
            </Box>
            
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                <DashboardCard
                    title="Gestionar Equipos"
                    description="Ver, crear, editar y eliminar el inventario de equipos médicos."
                    link="/equipos"
                    icon={<DevicesIcon sx={{ fontSize: 32, color: 'white' }} />}
                />
                
                <DashboardCard
                    title="Gestionar Usuarios"
                    description="Ver, crear, editar y eliminar las cuentas del personal médico."
                    link="/admin/usuarios"
                    icon={<PeopleIcon sx={{ fontSize: 32, color: 'white' }} />}
                    disabled={user?.rol !== 'ADMIN'}
                />
            </Grid>
        </Container>
    );
};

export default DashboardPage;