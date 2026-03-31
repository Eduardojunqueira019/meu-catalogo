const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.profile.updateMany({
    data: {
      role: 'Vendedor de Veículos'
    }
  });
  console.log(`Updated ${result.count} profile(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
