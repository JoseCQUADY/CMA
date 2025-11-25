import { Outlet } from 'react-router-dom';
import { Box, Fade } from '@mui/material';
import Navbar from './Navbar';
import React from 'react';

const MainLayout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, sm: 3 },
                    transition: 'padding 0.3s ease-in-out',
                }}
            >
                <Fade in={true} timeout={400}>
                    <Box>
                        <Outlet /> 
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
};

export default MainLayout;