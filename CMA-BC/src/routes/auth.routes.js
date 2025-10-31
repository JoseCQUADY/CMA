import express from 'express';
import { login, logout, profile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

router.post('/login', login);

router.post('/logout', authenticateToken, logout);

router.get('/me', authenticateToken, profile);

export default router;