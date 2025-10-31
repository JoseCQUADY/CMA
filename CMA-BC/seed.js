import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('tecnico123', 10);

    const admin = await prisma.usuario.upsert({
        where: { email: 'tecnico@hospital.com' },
        update: {}, 
        create: {
            email: 'tecnico@hospital.com',
            nombre: 'Técnico de Soporte',
            password: password,
            rol: 'TECNICO',
        },
    });
    console.log({ admin });
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });