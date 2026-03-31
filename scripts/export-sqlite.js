const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db',
      },
    },
  });

  console.log('Exportando dados do SQLite...');

  try {
    const vehicles = await prisma.vehicle.findMany();
    const leads = await prisma.lead.findMany();
    const profiles = await prisma.profile.findMany();

    const data = { vehicles, leads, profiles };
    fs.writeFileSync(path.join(__dirname, '../temp_data.json'), JSON.stringify(data, null, 2));

    console.log(`Sucesso! ${vehicles.length} veículos, ${leads.length} leads e ${profiles.length} perfis exportados.`);
  } catch (err) {
    console.error('Erro ao exportar:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
