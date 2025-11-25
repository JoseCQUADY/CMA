import axiosInstance from '../utils/axiosInstance';

/**
 * Get system statistics
 * Demonstrates AJAX + JSON with web service
 */
export const getSystemStats = async () => {
    const response = await axiosInstance.get('/stats');
    return response.data;
};

/**
 * Get equipment summary
 */
export const getEquiposSummary = async () => {
    const response = await axiosInstance.get('/stats/equipos-summary');
    return response.data;
};

/**
 * Get detailed maintenance records
 */
export const getMantenimientosDetalle = async (equipoId = null) => {
    const params = equipoId ? `?equipoId=${equipoId}` : '';
    const response = await axiosInstance.get(`/stats/mantenimientos-detalle${params}`);
    return response.data;
};

/**
 * Get equipment with pending maintenance
 */
export const getEquiposPendientes = async () => {
    const response = await axiosInstance.get('/stats/equipos-pendientes');
    return response.data;
};
