import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import equipoRoutes from './routes/equipo.routes.js';
import mantenimientoRoutes from './routes/mantenimiento.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { prismaErrorHandler } from './middlewares/prismaErrorHandler.middleware.js';

const app = express();

// Security: Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: 'Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security: General rate limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { message: 'Demasiadas solicitudes. Intente de nuevo en un momento.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for development
}));

app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Apply stricter rate limit to login
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);

app.use(prismaErrorHandler);

app.use(errorHandler);

export default app;