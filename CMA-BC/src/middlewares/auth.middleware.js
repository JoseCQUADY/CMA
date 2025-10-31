import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;

    if (token == null) {
        return res.status(401).json({ message: "Acceso no autorizado. Se requiere iniciar sesión." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido o expirado." });
        }
        req.user = user;
        next();
    });
}