import { Prisma } from '@prisma/client';

export const prismaErrorHandler = (err, req, res, next) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', err.code);

        switch (err.code) {
            case 'P2002': {
                const field = err.meta?.target?.[0];
                const message = `Ya existe un registro con este valor en el campo: ${field}.`;
                return res.status(409).json({ message });
            }
            case 'P2003': {
                const field = err.meta?.field_name;
                const message = `El registro relacionado en el campo '${field}' no fue encontrado.`;
                return res.status(404).json({ message });
            }
            case 'P2025': {
                const message = 'El registro que intentas modificar o eliminar no existe.';
                return res.status(404).json({ message });
            }
            default: {
                const message = `Error de base de datos: ${err.code}.`;
                return res.status(400).json({ message });
            }
        }
    }

    next(err);
};