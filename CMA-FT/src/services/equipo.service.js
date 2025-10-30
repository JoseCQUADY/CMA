import axiosInstance from '../utils/axiosInstance';

export const getAllEquipos = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/equipos?page=${page}&limit=${limit}`);
    return response.data;
};

export const getEquipoById = async (id) => {
    const response = await axiosInstance.get(`/equipos/${id}`);
    return response.data;
};

export const createEquipo = async (formData) => {
    const response = await axiosInstance.post('/equipos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateEquipo = async (id, formData) => {
    const response = await axiosInstance.put(`/equipos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteEquipo = async (id) => {
    await axiosInstance.delete(`/equipos/${id}`);
};

export const deleteManual = async (equipoId) => {
    await axiosInstance.delete(`/equipos/${equipoId}/manual`);
};

export const getMantenimientosByEquipoId = async (equipoId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/equipos/${equipoId}/mantenimientos?page=${page}&limit=${limit}`);
    return response.data;
};