import { body } from 'express-validator';

export const createEquipoValidator = [
    body('nombre').isString().notEmpty().withMessage('El nombre es requerido.'),
    body('marca').isString().notEmpty().withMessage('La marca es requerida.'),
    body('modelo').isString().notEmpty().withMessage('El modelo es requerido.'),
    body('numeroSerie').isString().notEmpty().withMessage('El número de serie es requerido.'),
    body('idControl').isString().notEmpty().withMessage('El ID de control es requerido.'),
    body('ubicacion').isString().notEmpty().withMessage('La ubicación es requerida.'),
    body('descripcionPDF').optional().isString().notEmpty().withMessage('La descripción del PDF no puede estar vacía si se envía.'),
];

export const updateEquipoValidator = [
    body('nombre').optional().isString().notEmpty(),
    body('marca').optional().isString().notEmpty(),
    body('modelo').optional().isString().notEmpty(),
    body('numeroSerie').optional().isString().notEmpty(),
    body('idControl').optional().isString().notEmpty(),
    body('ubicacion').optional().isString().notEmpty(),
    body('descripcionPDF').optional().isString(),
];