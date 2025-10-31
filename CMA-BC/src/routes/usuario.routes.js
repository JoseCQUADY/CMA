import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/usuario.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/authorization.middleware.js';
import { createUserValidator, updateUserValidator } from '../validators/usuario.validator.js';
import { validateFields } from '../middlewares/validator.middleware.js';

const router = express.Router();

router.use(authenticateToken, authorizeRole(['ADMIN']));

router.get('/', getAllUsers);

router.post('/', createUserValidator, validateFields, createUser);

router.get('/:id', getUserById);

router.put('/:id', updateUserValidator, validateFields, updateUser);

router.delete('/:id', deleteUser);

export default router;