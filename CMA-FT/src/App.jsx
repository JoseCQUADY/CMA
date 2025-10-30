import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import React from 'react';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipoListPage from './pages/EquipoListPage';
import EquipoDetailPage from './pages/EquipoDetailPage';
import UsuarioListPage from './pages/UsuarioListPage';
import MantenimientoPorEquipoPage from './pages/MantenimientoPorEquipoPage';
import MantenimientoDetailPage from './pages/MantenimientoDetailPage';

function AppRouter() {
    const { user } = useAuth();

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
                <Route element={<MainLayout />}> <Route path="/equipo/:id" element={<EquipoDetailPage />} /> </Route>
                
                {user && (
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/equipos" element={<EquipoListPage />} />
                        <Route path="/equipo/:id/mantenimientos" element={<MantenimientoPorEquipoPage />} />
                        <Route path="/mantenimiento/:id" element={<MantenimientoDetailPage />} />
                        {user.rol === 'ADMIN' && (
                            <Route path="/admin/usuarios" element={<UsuarioListPage />} />
                        )}
                    </Route>
                )}
                
                <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </Router>
    );
}

function AppContent() {
    const { loading } = useAuth();
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return <AppRouter />;
}

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <AppContent />
        </AuthProvider>
    );
}

export default App;