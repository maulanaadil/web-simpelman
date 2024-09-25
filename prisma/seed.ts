import { PrismaClient } from '@prisma/client';
import { garden, graveyard } from './prebuilt';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@simpleman.com',
      name: 'Admin',
      password: 'admin123',
      idCard: '1234567890',
      phoneNumber: '81234567890',
      role: 'admin',
    },
  });

  garden.forEach(async (data) => {
    await prisma.garden.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address,
        photo: {
          createMany: {
            data: data.photos,
          },
        },
      },
    });
  });

  graveyard.forEach(async (data) => {
    await prisma.graveyard.create({
      data: {
        name: data.name,
        mapsUrl: data.mapsUrl,
        address: data.address,
        numberOfGrave: data.numberOfGrave,
        religion: data.religion,
        type: data.type,
        additionalInfo: data.additionalInfo || {},
        photo: {
          createMany: {
            data: data.photos,
          },
        },
      },
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
