import { PrismaClient } from '@prisma/client';

// Create Prisma client with query logging enabled
export const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});

// Format and log SQL queries with timestamp
prisma.$on('query', (e) => {
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    PRISMA ORM QUERY LOG                          ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║ Timestamp: ${new Date().toISOString()}`);
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║ SQL Query:');
    console.log(`║ ${e.query}`);
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║ Parameters:');
    console.log(`║ ${e.params}`);
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║ Duration: ${e.duration}ms`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
});