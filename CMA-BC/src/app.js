import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import equipoRoutes from './routes/equipo.routes.js';
import mantenimientoRoutes from './routes/mantenimiento.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { prismaErrorHandler } from './middlewares/prismaErrorHandler.middleware.js';

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);

app.use(prismaErrorHandler);

app.use(errorHandler);

export default app;