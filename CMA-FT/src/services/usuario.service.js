import axiosInstance from '../utils/axiosInstance';

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        const response = await axiosInstance.get(`/usuarios?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        throw error;
    }
};

 export const createUser = async (data) => {
     const response = await axiosInstance.post('/usuarios', data);
     return response.data;
 };
 
 export const updateUser = async (id, data) => {
     const response = await axiosInstance.put(`/usuarios/${id}`, data);
     return response.data;
 };
 
 export const deleteUser = async (id) => {
     await axiosInstance.delete(`/usuarios/${id}`);
 };