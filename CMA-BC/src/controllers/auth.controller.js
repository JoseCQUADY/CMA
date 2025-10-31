import { login as loginService } from '../services/auth.service.js';

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const token = await loginService(email, password);

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
        });

          res.cookie('session_exists', 'true', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } catch (error) {
        if (error.message.includes('desactivada')) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(401).json({ message: error.message });
    }
}

export function logout(req, res) {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
}

export function profile(req, res) {
    res.json(req.user);
}