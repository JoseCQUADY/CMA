import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@hospital.com' },
        update: {}, 
        create: {
            email: 'admin@hospital.com',
            nombre: 'Administrador',
            password: password,
            rol: 'ADMIN',
        },
    });
    console.log({ admin });
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
