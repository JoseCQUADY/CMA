import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/authorization.middleware.js';

const router = express.Router();

router.get('/public', (req, res) => {
    res.send('Este es un endpoint público.');
});

router.get('/tecnico-area', authenticateToken, authorizeRole(['ADMIN', 'TECNICO']), (req, res) => {
    res.send(`Bienvenido ${req.user.nombre}. Tienes acceso al área de técnicos.`);
});

router.get('/admin-area', authenticateToken, authorizeRole(['ADMIN']), (req, res) => {
    res.send(`Bienvenido, admin ${req.user.nombre}. Tienes acceso al panel de administración.`);
});

export default router;