import * as yup from 'yup';

export const mantenimientoSchema = yup.object().shape({
    tipoMantenimiento: yup.string().required('El tipo de mantenimiento es requerido.'),
    fecha: yup.string().required('La fecha es requerida.'),
    observaciones: yup.string().required('Las observaciones son requeridas.'),
});