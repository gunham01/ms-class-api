const { PrismaClient } = require('@prisma/client');

const Prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

module.exports = Prisma;
