import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';


const AdminRoute = () => {
    const { user } = useAuth(); 

    if (user && user.rol === 'ADMIN') {
        return <Outlet />;
    }
    
    return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;