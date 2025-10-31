export function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        const { rol } = req.user;
        if (allowedRoles.includes(rol)) {
            next();
        } else {
            res.status(403).json({ message: 'Acceso prohibido: Permisos insuficientes.' });
        }
    };
}