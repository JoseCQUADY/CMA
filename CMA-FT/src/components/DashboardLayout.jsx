import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Tooltip, useMediaQuery, Fade, Collapse,
    alpha
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import logo from '../assets/logo.svg';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 260;

// Styled components for the layout
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })(
    ({ theme, open, isMobile }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
        ...(open && !isMobile && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2),
        },
    }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })(
    ({ theme, open, isMobile }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && !isMobile && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
    }),
);

// Page transition wrapper component
export const PageTransition = ({ children, loading = false }) => {
    const [show, setShow] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setShow(false);
        const timer = setTimeout(() => setShow(true), 50);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <Fade in={show && !loading} timeout={400}>
            <Box>{children}</Box>
        </Fade>
    );
};

// Content wrapper for fetched data with fade animation
export const FadeInContent = ({ children, show = true, delay = 0 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => setVisible(true), delay);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [show, delay]);

    return (
        <Fade in={visible} timeout={400}>
            <Box>{children}</Box>
        </Fade>
    );
};

const DashboardLayout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { toggleTheme, isDarkMode } = useThemeMode();
    
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const [pageReady, setPageReady] = useState(false);

    // Update drawer state when screen size changes
    useEffect(() => {
        setDrawerOpen(!isMobile);
    }, [isMobile]);

    // Page transition animation
    useEffect(() => {
        setPageReady(false);
        const timer = setTimeout(() => setPageReady(true), 100);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleDrawerToggle = useCallback(() => {
        setDrawerOpen(prev => !prev);
    }, []);

    const handleProfileMenuOpen = (event) => setProfileMenuAnchor(event.currentTarget);
    const handleProfileMenuClose = () => setProfileMenuAnchor(null);

    const handleLogout = async () => {
        await logout();
        handleProfileMenuClose();
        navigate('/login');
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // Navigation items
    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, show: true },
        { label: 'Equipos', path: '/equipos', icon: <DevicesIcon />, show: true },
        { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon />, show: user?.rol === 'ADMIN' },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Header */}
            <DrawerHeader>
                <Box 
                    component={Link} 
                    to="/dashboard" 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        textDecoration: 'none', 
                        color: 'inherit',
                        py: 1,
                        pl: 1,
                    }}
                >
                    <img 
                        src={logo} 
                        alt="Logo" 
                        style={{ 
                            height: '36px', 
                            width: 'auto',
                            filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                        }} 
                    />
                </Box>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </DrawerHeader>
            
            <Divider />

            {/* User Info Section */}
            {user && (
                <Box sx={{ p: 2 }}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.08),
                        }}
                    >
                        <Avatar 
                            sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                width: 40, 
                                height: 40,
                                fontWeight: 600,
                            }}
                        >
                            {getInitials(user.nombre)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography 
                                variant="subtitle2" 
                                noWrap 
                                sx={{ fontWeight: 600 }}
                            >
                                {user.nombre}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ color: 'text.secondary' }}
                            >
                                {user.rol}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}
            
            <Divider />

            {/* Navigation Items */}
            <List sx={{ px: 1, py: 2, flex: 1 }}>
                {navItems.filter(item => item.show).map((item, index) => (
                    <Fade in={true} timeout={300 + (index * 100)} key={item.path}>
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton 
                                onClick={() => handleNavigate(item.path)}
                                selected={isActive(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.2,
                                    '&.Mui-selected': {
                                        backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.12),
                                        color: 'primary.main',
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.main',
                                        },
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.15),
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.1 : 0.05),
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.label} 
                                    primaryTypographyProps={{ 
                                        fontWeight: isActive(item.path) ? 600 : 500,
                                        fontSize: '0.9rem',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Fade>
                ))}
            </List>

            <Divider />

            {/* Bottom Section - Settings */}
            <List sx={{ px: 1, py: 1 }}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                        onClick={toggleTheme}
                        sx={{ 
                            borderRadius: 2, 
                            py: 1.2,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.1 : 0.05),
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </ListItemIcon>
                        <ListItemText 
                            primary={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'} 
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                        />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={handleLogout}
                        sx={{ 
                            borderRadius: 2, 
                            py: 1.2,
                            color: 'error.main',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.08),
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Cerrar Sesión" 
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <StyledAppBar 
                position="fixed" 
                open={drawerOpen} 
                isMobile={isMobile}
                elevation={0}
                sx={{ 
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
                className="no-print"
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ 
                            mr: 2, 
                            color: 'text.primary',
                            ...(drawerOpen && !isMobile && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    {/* Mobile Logo */}
                    {isMobile && (
                        <Box 
                            component={Link} 
                            to="/dashboard" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                textDecoration: 'none',
                            }}
                        >
                            <img 
                                src={logo} 
                                alt="Logo" 
                                style={{ 
                                    height: '32px', 
                                    width: 'auto',
                                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                                }} 
                            />
                        </Box>
                    )}
                    
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Theme Toggle - Desktop */}
                    {!isMobile && (
                        <Tooltip title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}>
                            <IconButton 
                                onClick={toggleTheme} 
                                sx={{ mr: 1, color: 'text.primary' }}
                            >
                                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Profile Menu */}
                    <Tooltip title="Perfil">
                        <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    width: 36, 
                                    height: 36,
                                    fontWeight: 600,
                                }}
                            >
                                {getInitials(user?.nombre)}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    
                    <Menu
                        sx={{ mt: '45px' }}
                        anchorEl={profileMenuAnchor}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={Boolean(profileMenuAnchor)}
                        onClose={handleProfileMenuClose}
                        PaperProps={{
                            elevation: 2,
                            sx: {
                                minWidth: 200,
                                borderRadius: 2,
                                mt: 1,
                            }
                        }}
                    >
                        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                                {user?.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {user?.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.rol}
                            </Typography>
                        </Box>
                        {isMobile && (
                            <MenuItem onClick={() => { toggleTheme(); handleProfileMenuClose(); }}>
                                <ListItemIcon>
                                    {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                                </ListItemIcon>
                                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            Cerrar Sesión
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </StyledAppBar>

            {/* Drawer */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: 1,
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                    },
                }}
                variant={isMobile ? 'temporary' : 'persistent'}
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                className="no-print"
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Main open={drawerOpen} isMobile={isMobile}>
                <DrawerHeader />
                <Fade in={pageReady} timeout={400}>
                    <Box
                        sx={{
                            minHeight: 'calc(100vh - 88px)',
                        }}
                    >
                        <Outlet />
                    </Box>
                </Fade>
            </Main>
        </Box>
    );
};

export default DashboardLayout;
