import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Definir quantos números a rifa terá (exemplo: 100 números)
  const totalNumbers = 100;

  const rifas = [];
  for (let i = 1; i <= totalNumbers; i++) {
    rifas.push({
      number: i,
      status: 'AVAILABLE',
    });
  }

  // Criar números em lote
  await prisma.rifa.createMany({
    data: rifas,
    skipDuplicates: true,
  });

  console.log(`✅ ${totalNumbers} números criados com sucesso!`);
}

seed()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
