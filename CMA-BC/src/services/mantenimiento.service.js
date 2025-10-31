import { prisma } from '../config/prisma.js';
import { uploadFile, generatePresignedUrl, deleteFile } from './oci.service.js';

export async function createMantenimiento(mantenimientoData, tecnicoId, evidenciaFile) {
    const { equipoId, tipoMantenimiento, fecha, observaciones, fechaProximoManto } = mantenimientoData;
    let nombreObjetoEvidencia = null;

    if (evidenciaFile) {
        const objectName = `evidencias/${equipoId}-${Date.now()}-${evidenciaFile.originalname}`;
        nombreObjetoEvidencia = await uploadFile(evidenciaFile.buffer, objectName,evidenciaFile.mimetype);
    }

    return prisma.mantenimiento.create({
        data: {
            equipoId,
            tipoMantenimiento,
            fecha: new Date(fecha),
            observaciones,
            tecnicoId,
            nombreObjetoEvidencia,
            fechaProximoManto: fechaProximoManto ? new Date(fechaProximoManto) : null,
        }
    });
}

export async function updateMantenimientoById(id, data, userId, userRole, newEvidenciaFile) {
    
    const mantenimiento = await prisma.mantenimiento.findUnique({ where: { id } });
    if (!mantenimiento) throw new Error('Mantenimiento no encontrado.');
    if (userRole !== 'ADMIN' && mantenimiento.tecnicoId !== userId) {
        throw new Error('No tiene permiso para editar este registro.');
    }

    const oldEvidenciaName = mantenimiento.nombreObjetoEvidencia;
    const updateData = { ...data };
    delete updateData.evidencia;

    if (newEvidenciaFile) {
        const objectName = `evidencias/${mantenimiento.equipoId}-${Date.now()}-${newEvidenciaFile.originalname}`;
        updateData.nombreObjetoEvidencia = await uploadFile(newEvidenciaFile.buffer, objectName,newEvidenciaFile.mimetype);
    }

    const updatedMantenimiento = await prisma.mantenimiento.update({
        where: { id },
        data: updateData,
    });

    if (newEvidenciaFile && oldEvidenciaName) {
        await deleteFile(oldEvidenciaName);
    }

    return updatedMantenimiento;
}

export async function deleteEvidenciaFromMantenimiento(id, userId, userRole) {
    const mantenimiento = await prisma.mantenimiento.findUnique({ where: { id } });
    if (!mantenimiento) throw new Error('Mantenimiento no encontrado.');
    if (userRole !== 'ADMIN' && mantenimiento.tecnicoId !== userId) {
        throw new Error('No tiene permiso para modificar este registro.');
    }

    const evidenciaNameToDelete = mantenimiento.nombreObjetoEvidencia;
    if (!evidenciaNameToDelete) throw new Error('El mantenimiento no tiene una evidencia para eliminar.');

    await deleteFile(evidenciaNameToDelete);
    return prisma.mantenimiento.update({
        where: { id },
        data: { nombreObjetoEvidencia: null },
    });
}

export async function softDeleteMantenimientoById(id) {
    const mantenimiento = await prisma.mantenimiento.findUnique({ where: { id } });
    if (mantenimiento && mantenimiento.nombreObjetoEvidencia) {
        await deleteFile(mantenimiento.nombreObjetoEvidencia);
    }
    return prisma.mantenimiento.update({
        where: { id },
        data: { estado: 'INACTIVO' }
    });
}

export async function findMantenimientosByEquipoId(equipoId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [mantenimientos, total] = await prisma.$transaction([
        prisma.mantenimiento.findMany({
            where: { equipoId, estado: 'ACTIVO' },
            skip, take: limit,
            include: { tecnico: { select: { nombre: true } } },
            orderBy: { fecha: 'desc' }
        }),
        prisma.mantenimiento.count({ where: { equipoId, estado: 'ACTIVO' } })
    ]);

    const mantenimientosConUrl = await Promise.all(
        mantenimientos.map(async (m) => {
            const urlSeguraEvidencia = await generatePresignedUrl(m.nombreObjetoEvidencia);
            return { ...m, urlSeguraEvidencia };
        })
    );
    
    return { data: mantenimientosConUrl, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findMantenimientoById(id) {
    const mantenimiento = await prisma.mantenimiento.findUnique({
        where: { id, estado: 'ACTIVO' },
        include: {
            tecnico: { select: { nombre: true } },
            equipo: { select: { id: true, nombre: true, modelo: true } }
        }
    });
    if (!mantenimiento) return null;
    mantenimiento.urlSeguraEvidencia = await generatePresignedUrl(mantenimiento.nombreObjetoEvidencia);
    return mantenimiento;
}