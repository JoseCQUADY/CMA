import { body } from 'express-validator';

export const createMantenimientoValidator = [
    body('equipoId').isUUID().withMessage('El ID del equipo debe ser un UUID válido.'),
    body('tipoMantenimiento').isString().notEmpty().withMessage('El tipo de mantenimiento es requerido.'),
    body('fecha').isISO8601().toDate().withMessage('La fecha debe estar en formato ISO8601.'),
    body('observaciones').isString().notEmpty().withMessage('Las observaciones son requeridas.'),
    body('fechaProximoManto').optional().isISO8601().toDate()
];

export const updateMantenimientoValidator = [
    body('tipoMantenimiento').optional().isString().notEmpty(),
    body('fecha').optional().isISO8601().toDate(),
    body('observaciones').optional().isString().notEmpty(),
    body('fechaProximoManto').optional({ nullable: true }).isISO8601().toDate(),
    body('estado').optional().isIn(['ACTIVO', 'INACTIVO'])
];