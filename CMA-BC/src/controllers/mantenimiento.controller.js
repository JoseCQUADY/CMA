import * as mantenimientoService from '../services/mantenimiento.service.js';

export async function createMantenimiento(req, res, next) {
    try {
        const tecnicoId = req.user.id;
        const evidenciaFile = req.file;
        const nuevoMantenimiento = await mantenimientoService.createMantenimiento(req.body, tecnicoId, evidenciaFile,req.file.mimetype);
        res.status(201).json(nuevoMantenimiento);
    } catch (error) {
        next(error);
    }
}

export async function updateMantenimiento(req, res, next) {

    try {
        const userId = req.user.id;
        const userRole = req.user.rol;
        const newEvidenciaFile = req.file;
        const updatedMantenimiento = await mantenimientoService.updateMantenimientoById(req.params.id, req.body, userId, userRole, newEvidenciaFile);
        res.json(updatedMantenimiento);
    } catch (error) {
        if (error.message.includes('No tiene permiso')) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
}

export async function deleteMantenimiento(req, res, next) {
    try {
        await mantenimientoService.softDeleteMantenimientoById(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getMantenimientosByEquipo(req, res, next) {
    try {
        const { equipoId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await mantenimientoService.findMantenimientosByEquipoId(equipoId, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getMantenimientoById(req, res, next) {
    try {
        const { id } = req.params;
        const mantenimiento = await mantenimientoService.findMantenimientoById(id);
        if (!mantenimiento) {
            return res.status(404).json({ message: 'Registro de mantenimiento no encontrado.' });
        }
        res.json(mantenimiento);
    } catch (error) {
        next(error);
    }
}

export async function deleteEvidencia(req, res, next) {
    try {
        const userId = req.user.id;
        const userRole = req.user.rol;
        await mantenimientoService.deleteEvidenciaFromMantenimiento(req.params.id, userId, userRole);
        res.status(200).json({ message: 'Evidencia eliminada exitosamente.' });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('No tiene permiso')) {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
}