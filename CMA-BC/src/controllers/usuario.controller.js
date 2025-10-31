import * as usuarioService from '../services/usuario.service.js';

export async function createUser(req, res, next) {
    try {
        const newUser = await usuarioService.createUser(req.body);
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        next(error);
    }
}

export async function getAllUsers(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await usuarioService.findAllUsers(page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req, res, next) {
    try {
        const user = await usuarioService.findUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export async function updateUser(req, res, next) {
    try {
        const updatedUser = await usuarioService.updateUserById(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(req, res, next) {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: 'No puede desactivar su propia cuenta.' });
        }
        await usuarioService.softDeleteUserById(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}