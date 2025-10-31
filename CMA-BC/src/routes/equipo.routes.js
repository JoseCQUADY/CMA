import express from 'express';
import { createEquipo, getEquipoById, getAllEquipos, updateEquipo, deleteEquipo, deleteManual } from '../controllers/equipo.controller.js';
import { getMantenimientosByEquipo } from '../controllers/mantenimiento.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/authorization.middleware.js';
import { uploadManual } from '../middlewares/upload.middleware.js';
import { createEquipoValidator, updateEquipoValidator } from '../validators/equipo.validator.js';
import { validateFields } from '../middlewares/validator.middleware.js';

const router = express.Router();

router.get('/:id', getEquipoById);
router.get('/:equipoId/mantenimientos', getMantenimientosByEquipo);

router.use(authenticateToken, authorizeRole(['ADMIN', 'TECNICO']));

router.get('/', getAllEquipos);

router.post(
    '/',
    uploadManual.single('pdf'),
    createEquipoValidator,
    validateFields,
    createEquipo
);

router.put(
    '/:id',
    uploadManual.single('pdf'),
    updateEquipoValidator,
    validateFields,
    updateEquipo
);

router.delete(
    '/:id',
    authorizeRole(['ADMIN']),
    deleteEquipo
);

router.delete(
    '/:id/manual',
    deleteManual
);

export default router;