import React, { useState } from 'react';
import { 
    AppBar, Toolbar, Button, Box, IconButton, Drawer, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
    Menu, MenuItem, Avatar, Typography
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
    
    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const isDashboardActive = location.pathname === '/dashboard';

    const drawerContent = (
        <Box
            sx={{ width: 250, height: '100%', backgroundColor: 'primary.main', color: 'white' }}
            role="presentation"
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            <List>
                {user ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleNavigate('/dashboard')}>
                                <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Cerrar Sesión" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleNavigate('/login')}>
                            <ListItemIcon sx={{ color: 'white' }}><LoginIcon /></ListItemIcon>
                            <ListItemText primary="Iniciar Sesión" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
                <Toolbar>
                    <Link to={user ? "/dashboard" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                    </Link>
                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Button
                                    component={Link}
                                    to="/dashboard"
                                    sx={{ 
                                        my: 2, 
                                        color: 'white', 
                                        display: 'block',
                                        fontWeight: isDashboardActive ? 'bold' : 'normal',
                                        textDecoration: isDashboardActive ? 'underline' : 'none',
                                        textUnderlineOffset: '4px'
                                    }}
                                >
                                    Dashboard
                                </Button>
                                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}>
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
                                    <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                                        <Typography variant="subtitle1" noWrap>{user.nombre}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
                                    </Box>
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                        Cerrar Sesión
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button color="inherit" component={Link} to="/login">
                                Iniciar Sesión (Personal)
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton size="large" onClick={handleMobileMenuToggle} color="inherit">
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer anchor="right" open={mobileMenuOpen} onClose={handleMobileMenuToggle}>
                {drawerContent}
            </Drawer>
        </>
    );
};

export default Navbar;