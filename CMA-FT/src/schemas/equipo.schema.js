import * as yup from 'yup';

export const equipoSchema = yup.object().shape({
    nombre: yup.string().required('El nombre es requerido.'),
    marca: yup.string().required('La marca es requerida.'),
    modelo: yup.string().required('El modelo es requerido.'),
    numeroSerie: yup.string().required('El número de serie es requerido.'),
    idControl: yup.string().required('El ID de control es requerido.'),
    ubicacion: yup.string().required('La ubicación es requerida.'),
    descripcionPDF: yup.string(),
});