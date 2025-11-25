import { prisma } from '../config/prisma.js';
import { uploadFile, generatePresignedUrl, deleteFile } from './oci.service.js';

export async function createEquipo(equipoData, manualFile) {
    return prisma.$transaction(async (tx) => {
        const equipo = await tx.equipo.create({
            data: {
                nombre: equipoData.nombre,
                marca: equipoData.marca,
                modelo: equipoData.modelo,
                numeroSerie: equipoData.numeroSerie,
                idControl: equipoData.idControl,
                ubicacion: equipoData.ubicacion,
            }
        });

        if (manualFile) {
            const objectName = `manuales/${equipo.id}-${manualFile.originalname}`;
            await uploadFile(manualFile.buffer, objectName);
            await tx.equipo.update({
                where: { id: equipo.id },
                data: {
                    nombreObjetoPDF: objectName,
                    descripcionPDF: equipoData.descripcionPDF,
                }
            });
        }
        return equipo;
    });
}

export async function updateEquipoById(id, data, newManualFile) {
    const equipo = await prisma.equipo.findUnique({ where: { id, estado: 'ACTIVO' } });
    if (!equipo) throw new Error('Equipo no encontrado.');

    const oldManualName = equipo.nombreObjetoPDF;
    const updateData = { ...data };
    delete updateData.pdf; // Eliminar el campo 'pdf' si viene del form-data

    if (newManualFile) {
        const objectName = `manuales/${id}-${Date.now()}-${newManualFile.originalname}`;
        updateData.nombreObjetoPDF = await uploadFile(newManualFile.buffer, objectName);
    }

    const updatedEquipo = await prisma.equipo.update({
        where: { id },
        data: updateData,
    });

    if (newManualFile && oldManualName) {
        await deleteFile(oldManualName);
    }

    return updatedEquipo;
}

export async function deleteManualFromEquipo(id) {
    const equipo = await prisma.equipo.findUnique({ where: { id, estado: 'ACTIVO' } });
    if (!equipo) throw new Error('Equipo no encontrado.');
    
    const manualNameToDelete = equipo.nombreObjetoPDF;
    if (!manualNameToDelete) {
        throw new Error('El equipo no tiene un manual para eliminar.');
    }

    await deleteFile(manualNameToDelete);
    return prisma.equipo.update({
        where: { id },
        data: {
            nombreObjetoPDF: null,
            descripcionPDF: null,
        },
    });
}

export async function findEquipoById(id) {
    const equipo = await prisma.equipo.findUnique({
        where: { id, estado: 'ACTIVO' },
    });
    if (!equipo) return null;
    equipo.urlSeguraPDF = await generatePresignedUrl(equipo.nombreObjetoPDF);
    return equipo;
}

export async function findAllEquipos(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    
    // Build search filter if search term provided
    const searchFilter = search ? {
        OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { marca: { contains: search, mode: 'insensitive' } },
            { modelo: { contains: search, mode: 'insensitive' } },
            { numeroSerie: { contains: search, mode: 'insensitive' } },
            { idControl: { contains: search, mode: 'insensitive' } },
            { ubicacion: { contains: search, mode: 'insensitive' } },
        ]
    } : {};

    const whereClause = {
        estado: 'ACTIVO',
        ...searchFilter
    };

    const [equipos, total] = await prisma.$transaction([
        prisma.equipo.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.equipo.count({ where: whereClause })
    ]);
    return { data: equipos, total, page, totalPages: Math.ceil(total / limit), search };
}

export async function softDeleteEquipoById(id) {
    const equipo = await prisma.equipo.findUnique({ where: { id } });
    if (equipo && equipo.nombreObjetoPDF) {
        await deleteFile(equipo.nombreObjetoPDF);
    }
    return prisma.equipo.update({
        where: { id },
        data: { estado: 'INACTIVO' }
    });
}