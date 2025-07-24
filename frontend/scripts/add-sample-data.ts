import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleTransactions() {
  console.log('🎯 Adding realistic sample transaction data...');

  try {
    // Get required IDs from database
    const [comumOrigin, diogoOrigin, joannaOrigin] = await Promise.all([
      prisma.origin.findFirst({ where: { name: 'Comum' } }),
      prisma.origin.findFirst({ where: { name: 'Diogo' } }),
      prisma.origin.findFirst({ where: { name: 'Joana' } }),
    ]);

    const [activoBank, millenniumBank, montepioBank] = await Promise.all([
      prisma.bank.findFirst({ where: { name: { contains: 'Activo', mode: 'insensitive' } } }),
      prisma.bank.findFirst({ where: { name: { contains: 'Millenium', mode: 'insensitive' } } }),
      prisma.bank.findFirst({ where: { name: { contains: 'Montepio', mode: 'insensitive' } } }),
    ]);

    // Get some category IDs for realistic categorization
    const categories = await prisma.category.findMany();
    const salarioCategory = categories.find(c => c.category === 'Salario' && c.subCategory === 'Salario Liq.');
    const supermercadoCategory = categories.find(c => c.category === 'Alimentação' && c.subCategory === 'Supermercado');
    const combustivelCategory = categories.find(c => c.category === 'Transportes' && c.subCategory === 'Carro Combustivel');
    const restauranteCategory = categories.find(c => c.category === 'Alimentação' && c.subCategory === 'Refeições fora de casa');
    const electricidadeCategory = categories.find(c => c.category === 'Casa' && c.subCategory === 'Electricidade');
    const ginasioCategory = categories.find(c => c.category === 'Desporto' && c.subCategory === 'Ginásio');
    const spotifyCategory = categories.find(c => c.category === 'Subscrições' && c.subCategory === 'Spotify');

    // Sample transactions for the last 3 months
    const baseDate = new Date();
    const sampleTransactions = [
      // January 2025 - Recent transactions
      {
        date: new Date('2025-01-15'),
        originId: diogoOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'ENTRADA' as const,
        categoryId: salarioCategory?.id || '',
        description: 'SALARIO MENSAL EMPRESA XYZ',
        incomes: 2800.00,
        outgoings: null,
        notes: 'Salário mensal',
        month: 'JANEIRO' as const,
        year: 2025,
        externalId: 'sample-txn-001',
        isAiGenerated: true,
        aiConfidence: 0.95,
        isValidated: true,
      },
      {
        date: new Date('2025-01-20'),
        originId: comumOrigin?.id || '',
        bankId: millenniumBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: supermercadoCategory?.id || '',
        description: 'CONTINENTE COLOMBO',
        incomes: null,
        outgoings: 85.40,
        notes: 'Compras semanais',
        month: 'JANEIRO' as const,
        year: 2025,
        externalId: 'sample-txn-002',
        isAiGenerated: true,
        aiConfidence: 0.92,
        isValidated: true,
      },
      {
        date: new Date('2025-01-18'),
        originId: diogoOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: combustivelCategory?.id || '',
        description: 'GALP ENERGIA BENFICA',
        incomes: null,
        outgoings: 65.20,
        notes: 'Combustível carro',
        month: 'JANEIRO' as const,
        year: 2025,
        externalId: 'sample-txn-003',
        isAiGenerated: true,
        aiConfidence: 0.98,
        isValidated: true,
      },
      {
        date: new Date('2025-01-22'),
        originId: joannaOrigin?.id || '',
        bankId: montepioBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: restauranteCategory?.id || '',
        description: 'RESTAURANTE AVENIDAS NOVAS',
        incomes: null,
        outgoings: 45.50,
        notes: 'Jantar em casal',
        month: 'JANEIRO' as const,
        year: 2025,
        externalId: 'sample-txn-004',
        isAiGenerated: true,
        aiConfidence: 0.85,
        isValidated: false,
      },
      {
        date: new Date('2025-01-10'),
        originId: comumOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: electricidadeCategory?.id || '',
        description: 'EDP COMERCIAL FATURA JANEIRO',
        incomes: null,
        outgoings: 120.30,
        notes: 'Conta da luz mensal',
        month: 'JANEIRO' as const,
        year: 2025,
        externalId: 'sample-txn-005',
        isAiGenerated: true,
        aiConfidence: 0.96,
        isValidated: true,
      },

      // December 2024 transactions
      {
        date: new Date('2024-12-15'),
        originId: diogoOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'ENTRADA' as const,
        categoryId: salarioCategory?.id || '',
        description: 'SALARIO DEZEMBRO + SUBSIDIO NATAL',
        incomes: 3200.00,
        outgoings: null,
        notes: 'Salário + subsídio de Natal',
        month: 'DEZEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-006',
        isAiGenerated: true,
        aiConfidence: 0.95,
        isValidated: true,
      },
      {
        date: new Date('2024-12-24'),
        originId: comumOrigin?.id || '',
        bankId: millenniumBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: supermercadoCategory?.id || '',
        description: 'PINGO DOCE COMPRAS NATAL',
        incomes: null,
        outgoings: 245.80,
        notes: 'Compras para a ceia de Natal',
        month: 'DEZEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-007',
        isAiGenerated: true,
        aiConfidence: 0.88,
        isValidated: true,
      },
      {
        date: new Date('2024-12-01'),
        originId: diogoOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: ginasioCategory?.id || '',
        description: 'HOLMES PLACE MENSALIDADE',
        incomes: null,
        outgoings: 75.00,
        notes: 'Mensalidade ginásio',
        month: 'DEZEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-008',
        isAiGenerated: true,
        aiConfidence: 0.94,
        isValidated: true,
      },
      {
        date: new Date('2024-12-03'),
        originId: joannaOrigin?.id || '',
        bankId: montepioBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: spotifyCategory?.id || '',
        description: 'SPOTIFY PREMIUM FAMILY',
        incomes: null,
        outgoings: 7.99,
        notes: 'Subscrição mensal Spotify',
        month: 'DEZEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-009',
        isAiGenerated: true,
        aiConfidence: 0.99,
        isValidated: true,
      },

      // November 2024 transactions
      {
        date: new Date('2024-11-15'),
        originId: diogoOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'ENTRADA' as const,
        categoryId: salarioCategory?.id || '',
        description: 'SALARIO NOVEMBRO EMPRESA XYZ',
        incomes: 2800.00,
        outgoings: null,
        notes: 'Salário mensal',
        month: 'NOVEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-010',
        isAiGenerated: true,
        aiConfidence: 0.95,
        isValidated: true,
      },
      {
        date: new Date('2024-11-25'),
        originId: comumOrigin?.id || '',
        bankId: millenniumBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: supermercadoCategory?.id || '',
        description: 'LIDL COMPRAS SEMANAIS',
        incomes: null,
        outgoings: 67.30,
        notes: 'Compras da semana',
        month: 'NOVEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-011',
        isAiGenerated: true,
        aiConfidence: 0.91,
        isValidated: true,
      },
      {
        date: new Date('2024-11-18'),
        originId: diogoOrigin?.id || '',
        bankId: activoBank?.id || '',
        flow: 'SAIDA' as const,
        categoryId: combustivelCategory?.id || '',
        description: 'BP BENFICA POSTO COMBUSTIVEL',
        incomes: null,
        outgoings: 58.90,
        notes: 'Combustível',
        month: 'NOVEMBRO' as const,
        year: 2024,
        externalId: 'sample-txn-012',
        isAiGenerated: true,
        aiConfidence: 0.97,
        isValidated: true,
      },
    ].filter(t => t.originId && t.bankId && t.categoryId); // Only include transactions with valid IDs

    // Insert sample transactions
    for (const transaction of sampleTransactions) {
      try {
        await prisma.transaction.upsert({
          where: { externalId: transaction.externalId },
          update: transaction,
          create: transaction,
        });
        console.log(`✅ Added: ${transaction.description} - €${transaction.incomes || transaction.outgoings}`);
      } catch (error) {
        console.error(`❌ Failed to add transaction: ${transaction.description}`, error);
      }
    }

    console.log(`🎉 Successfully added ${sampleTransactions.length} sample transactions!`);

    // Display summary
    const summary = await prisma.transaction.aggregate({
      _sum: {
        incomes: true,
        outgoings: true,
      },
      _count: true,
    });

    console.log('\n📊 Database Summary:');
    console.log(`Total Transactions: ${summary._count}`);
    console.log(`Total Income: €${summary._sum.incomes?.toFixed(2) || '0.00'}`);
    console.log(`Total Outgoings: €${summary._sum.outgoings?.toFixed(2) || '0.00'}`);
    console.log(`Net Amount: €${((summary._sum.incomes || 0) - (summary._sum.outgoings || 0)).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  }
}

addSampleTransactions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });