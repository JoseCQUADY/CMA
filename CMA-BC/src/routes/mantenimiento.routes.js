import express from 'express';
import { createMantenimiento, updateMantenimiento, deleteMantenimiento, getMantenimientoById, deleteEvidencia } from '../controllers/mantenimiento.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/authorization.middleware.js';
import { uploadEvidencia } from '../middlewares/upload.middleware.js';
import { createMantenimientoValidator, updateMantenimientoValidator } from '../validators/mantenimiento.validator.js';
import { validateFields } from '../middlewares/validator.middleware.js';

const router = express.Router();

router.get('/:id', getMantenimientoById);

router.use(authenticateToken);

router.post(
    '/',
    authorizeRole(['ADMIN', 'TECNICO']),
    uploadEvidencia.single('evidencia'),
    createMantenimientoValidator,
    validateFields,
    createMantenimiento
);

router.put(
    '/:id',
    authorizeRole(['ADMIN', 'TECNICO']),
    uploadEvidencia.single('evidencia'),
    updateMantenimientoValidator,
    validateFields,
    updateMantenimiento
);

router.delete(
    '/:id',
    authorizeRole(['ADMIN']),
    deleteMantenimiento
);

router.delete(
    '/:id/evidencia',
    authorizeRole(['ADMIN', 'TECNICO']),
    deleteEvidencia
);

export default router;