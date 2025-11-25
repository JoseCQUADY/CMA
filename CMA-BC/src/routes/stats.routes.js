import express from 'express';
import { getStats, getEquiposSummary, getMantenimientosDetalle, getEquiposPendientes } from '../controllers/stats.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/stats
 * @desc Get system statistics
 * @access Protected
 */
router.get('/', getStats);

/**
 * @route GET /api/stats/equipos-summary
 * @desc Get equipment summary with maintenance info
 * @access Protected
 */
router.get('/equipos-summary', getEquiposSummary);

/**
 * @route GET /api/stats/mantenimientos-detalle
 * @desc Get detailed maintenance records
 * @access Protected
 */
router.get('/mantenimientos-detalle', getMantenimientosDetalle);

/**
 * @route GET /api/stats/equipos-pendientes
 * @desc Get equipment with pending maintenance
 * @access Protected
 */
router.get('/equipos-pendientes', getEquiposPendientes);

export default router;
