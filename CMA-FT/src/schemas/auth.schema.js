import * as yup from 'yup';

export const loginSchema = yup.object().shape({
    email: yup.string()
        .email('El formato del correo no es válido.')
        .required('El correo electrónico es requerido.'),
    password: yup.string()
        .required('La contraseña es requerida.'),
});