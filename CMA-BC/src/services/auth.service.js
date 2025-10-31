import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export async function login(email, password) {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
        throw new Error('Credenciales inválidas');
    }

    if (user.estado !== 'ACTIVO') {
        throw new Error('Su cuenta ha sido desactivada. Por favor, contacte al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
    }

    const payload = { id: user.id, nombre: user.nombre, rol: user.rol };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
}