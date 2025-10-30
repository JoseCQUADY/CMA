import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import React from 'react';


const LoginRoute = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default LoginRoute;