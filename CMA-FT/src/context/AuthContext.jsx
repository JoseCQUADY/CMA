import { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance.js';
import { getCookie } from '../utils/cookie.js';
import React from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserSession = async () => {
            const sessionFlag = getCookie('session_exists');
            if (sessionFlag) {
                try {
                    const response = await axiosInstance.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUserSession();
    }, []);

    const login = async (email, password) => {
        await axiosInstance.post('/auth/login', { email, password });
        const response = await axiosInstance.get('/auth/me');
        setUser(response.data);
    };

    const logout = async () => {
        await axiosInstance.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);