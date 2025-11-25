import React, { useState } from 'react';
import { 
    AppBar, Toolbar, Button, Box, IconButton, Drawer, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
    Menu, MenuItem, Avatar, Typography, useMediaQuery, Tooltip
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import logo from '../assets/logo.svg';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleTheme, isDarkMode } = useThemeMode();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

    const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
    const handleProfileMenuOpen = (event) => setProfileMenuAnchor(event.currentTarget);
    const handleProfileMenuClose = () => setProfileMenuAnchor(null);

    const handleNavigate = (path) => {
        navigate(path);
        handleMobileMenuToggle();
    };

    const handleLogout = async () => {
        const protectedPaths = ['/dashboard', '/equipos', '/admin/usuarios', '/equipo/:id/mantenimientos', '/mantenimiento/:id'];
        const isProtected = protectedPaths.some(path => location.pathname.startsWith(path.replace('/:id', '')));

        await logout();
        handleProfileMenuClose();
        if (mobileMenuOpen) handleMobileMenuToggle();

        if (isProtected) {
            navigate('/login');
        }
    };
    
    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, show: true },
        { label: 'Equipos', path: '/equipos', icon: <DevicesIcon />, show: true },
        { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon />, show: user?.rol === 'ADMIN' },
    ];

    const drawerContent = (
        <Box
            sx={{ width: 280, height: '100%', backgroundColor: 'primary.main', color: 'white' }}
            role="presentation"
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
            </Box>
            
            {user && (
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
                            {getInitials(user.nombre)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" noWrap>{user.nombre}</Typography>
                            <Typography variant="caption" sx={{ color: 'grey.300' }}>{user.rol}</Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            <List sx={{ pt: 1 }}>
                {user ? (
                    <>
                        {navItems.filter(item => item.show).map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton 
                                    onClick={() => handleNavigate(item.path)}
                                    selected={isActive(item.path)}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            }
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton onClick={toggleTheme}>
                                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                    {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                </ListItemIcon>
                                <ListItemText primary={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Cerrar Sesión" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={toggleTheme}>
                                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                    {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                </ListItemIcon>
                                <ListItemText primary={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleNavigate('/login')}>
                                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><LoginIcon /></ListItemIcon>
                                <ListItemText primary="Iniciar Sesión" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="sticky" sx={{ backgroundColor: 'primary.main' }} className="no-print">
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
                    <Link to={user ? "/dashboard" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="Logo" style={{ height: isMobile ? '32px' : '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                    </Link>
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                        {user ? (
                            <>
                                {navItems.filter(item => item.show).map((item) => (
                                    <Tooltip key={item.path} title={item.label}>
                                        <Button
                                            component={Link}
                                            to={item.path}
                                            startIcon={item.icon}
                                            sx={{ 
                                                color: 'white',
                                                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                                                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                                borderRadius: 2,
                                                px: 2,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                }
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    </Tooltip>
                                ))}
                                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 40, height: 40 }}>
                                        {getInitials(user.nombre)}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    anchorEl={profileMenuAnchor}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(profileMenuAnchor)}
                                    onClose={handleProfileMenuClose}
                                >
                                    <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider', minWidth: 200 }}>
                                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>{user.nombre}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.rol}</Typography>
                                    </Box>
                                    <MenuItem onClick={toggleTheme}>
                                        <ListItemIcon>
                                            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                                        </ListItemIcon>
                                        {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                        Cerrar Sesión
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Tooltip title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}>
                                    <IconButton onClick={toggleTheme} sx={{ color: 'white', mr: 1 }}>
                                        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Button 
                                    color="inherit" 
                                    component={Link} 
                                    to="/login"
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    Iniciar Sesión
                                </Button>
                            </>
                        )}
                    </Box>

                    {/* Mobile Menu Button */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton size="large" onClick={handleMobileMenuToggle} color="inherit">
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer 
                anchor="right" 
                open={mobileMenuOpen} 
                onClose={handleMobileMenuToggle}
                sx={{
                    '& .MuiDrawer-paper': {
                        boxShadow: theme.shadows[16],
                    }
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default Navbar;