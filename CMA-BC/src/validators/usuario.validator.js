import { body } from 'express-validator';

export const createUserValidator = [
    body('nombre').isString().notEmpty().withMessage('El nombre es requerido.'),
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    body('rol').optional().isIn(['ADMIN', 'TECNICO']).withMessage('Rol no válido.')
];

export const updateUserValidator = [
    body('nombre').optional().isString().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('rol').optional().isIn(['ADMIN', 'TECNICO']),
    body('estado').optional().isIn(['ACTIVO', 'INACTIVO']),
];