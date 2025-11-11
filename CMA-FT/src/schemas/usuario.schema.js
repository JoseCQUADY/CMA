import * as yup from 'yup';

const passwordValidation = yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.');

export const createUserSchema = yup.object().shape({
    nombre: yup.string()
        .required('El nombre es requerido.'),
    email: yup.string()
        .email('Debe ser un correo electrónico válido.')
        .required('El correo electrónico es requerido.'),
    password: passwordValidation
        .required('La contraseña es requerida.'),
    rol: yup.string()
        .oneOf(['ADMIN', 'TECNICO'], 'El rol no es válido.')
        .required('El rol es requerido.'),
});

export const updateUserSchema = yup.object().shape({
    nombre: yup.string()
        .required('El nombre es requerido.'),
    email: yup.string()
        .email('Debe ser un correo electrónico válido.')
        .required('El correo electrónico es requerido.'),
    rol: yup.string()
        .oneOf(['ADMIN', 'TECNICO'], 'El rol no es válido.')
        .required('El rol es requerido.'),
});