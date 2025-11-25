import * as equipoService from '../services/equipo.service.js';

export async function createEquipo(req, res, next) {
    try {
        const nuevoEquipo = await equipoService.createEquipo(req.body, req.file,req.file.mimetype);
        res.status(201).json(nuevoEquipo);
    } catch (error) {
        next(error);
    }
}

export async function getAllEquipos(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const result = await equipoService.findAllEquipos(page, limit, search);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getEquipoById(req, res, next) {
    try {
        const equipo = await equipoService.findEquipoById(req.params.id);
        if (!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }
        res.json(equipo);
    } catch (error) {
        next(error);
    }
}

export async function updateEquipo(req, res, next) {
    try {
        const updatedEquipo = await equipoService.updateEquipoById(req.params.id, req.body, req.file);
        res.json(updatedEquipo);
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
}

export async function deleteEquipo(req, res, next) {
    try {
        await equipoService.softDeleteEquipoById(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function deleteManual(req, res, next) {
    try {
        await equipoService.deleteManualFromEquipo(req.params.id);
        res.status(200).json({ message: 'Manual eliminado exitosamente.' });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
}