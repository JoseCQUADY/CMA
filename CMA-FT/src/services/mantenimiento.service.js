import axiosInstance from '../utils/axiosInstance';

export const getMantenimientoById = async (id) => {
    const response = await axiosInstance.get(`/mantenimientos/${id}`);
    return response.data;
};

export const createMantenimiento = async (data) => {
    const response = await axiosInstance.post('/mantenimientos', data);
    return response.data;
};

export const updateMantenimiento = async (id, formData) => {
    const response = await axiosInstance.put(`/mantenimientos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteMantenimiento = async (id) => {
    await axiosInstance.delete(`/mantenimientos/${id}`);
};

export const deleteEvidencia = async (mantenimientoId) => {
    await axiosInstance.delete(`/mantenimientos/${mantenimientoId}/evidencia`);
};