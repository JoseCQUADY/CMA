import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';


export async function createUser(userData) {
    const { email, password, nombre, rol } = userData;
    if (!email || !password || !nombre) {
        throw new Error('Nombre, email y contraseña son requeridos.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.usuario.create({
        data: {
            email,
            password: hashedPassword,
            nombre,
            rol: rol || 'TECNICO',
        },
    });
}

export async function findAllUsers(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    
    // Build search filter if search term provided
    let searchFilter = {};
    if (search) {
        const searchConditions = [
            { nombre: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
        
        // Only add rol filter if search matches a valid role
        const upperSearch = search.toUpperCase();
        if (upperSearch === 'ADMIN' || upperSearch === 'TECNICO') {
            searchConditions.push({ rol: { equals: upperSearch } });
        }
        
        searchFilter = { OR: searchConditions };
    }

    const whereClause = Object.keys(searchFilter).length > 0 ? searchFilter : {};

    const [usuarios, total] = await prisma.$transaction([
        prisma.usuario.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: { 
                id: true,
                email: true,
                nombre: true,
                rol: true,
                estado: true,
                createdAt: true
            }
        }),
        prisma.usuario.count({ where: whereClause })
    ]);
    return {
        data: usuarios,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        search
    };
}

export async function findUserById(id) {
    return prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
            estado: true,
            createdAt: true
        }
    });
}


export async function updateUserById(id, data) {
    const { password, ...restData } = data;
    
    const updateData = { ...restData };

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }
    
    return prisma.usuario.update({
        where: { id },
        data: updateData,
        select: { 
            id: true,
            email: true,
            nombre: true,
            rol: true,
            estado: true,
        }
    });
}


export async function softDeleteUserById(id) {
    return prisma.usuario.update({
        where: { id },
        data: { estado: 'INACTIVO' },
        select: {
            id: true,
            estado: true
        }
    });
}