import { PrismaClient } from '@prisma/client';
import { garden } from './prebuilt';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@simpleman.com',
      name: 'Admin',
      password: 'admin123',
      idCard: '1234567890',
      phoneNumber: '81234567890',
    },
  });

  garden.forEach(async (data) => {
    await prisma.garden.create({
      data,
    });
  });

  console.log('Seed success');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
