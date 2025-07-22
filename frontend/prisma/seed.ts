import { PrismaClient, TransactionFlow, MajorCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data based on your category structure
const origins = [
  { name: 'Comum' },
  { name: 'Joana' },
  { name: 'Diogo' },
];

const banks = [
  { name: 'Activo Bank' },
  { name: 'Millenium BCP' },
  { name: 'Montepio' },
  { name: 'Splitwise' },
  { name: 'Moey' },
  { name: 'Revolut' },
  { name: 'Cartão Alimentação' },
  { name: 'Wizink' },
];

// Categories based on your detailed structure
const categories = [
  // ENTRADA - RENDIMENTO
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO' as MajorCategory, category: 'Salario', subCategory: 'Salario Liq.' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO' as MajorCategory, category: 'Salario', subCategory: 'Subs.Alimentação' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO' as MajorCategory, category: 'Salario', subCategory: 'Mensalidade' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO' as MajorCategory, category: 'Salario', subCategory: 'IRS' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO' as MajorCategory, category: 'Salario', subCategory: 'Prémio' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO' as MajorCategory, category: 'Salario', subCategory: 'Subs.Férias' },

  // ENTRADA - RENDIMENTO EXTRA
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Vendas Usados', subCategory: 'Olx' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Vendas Usados', subCategory: 'Vinted' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Autocaravana', subCategory: 'Aluguer' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Prendas', subCategory: 'Monetário' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Outros Rendimentos', subCategory: 'Outros Rendimentos' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Projectos', subCategory: 'Jogo Brides' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Projectos', subCategory: 'Medium' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Projectos', subCategory: 'Projecto Y' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Crédito Habitação', subCategory: 'Empréstimo Obras' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Reembolsos', subCategory: 'Reemb. Seguro Saúde' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Reembolsos', subCategory: 'Reemb. Prestração' },
  { flow: 'ENTRADA' as TransactionFlow, majorCategory: 'RENDIMENTO_EXTRA' as MajorCategory, category: 'Reembolsos', subCategory: 'Reemb. IVA' },

  // SAIDA - ECONOMIA E INVESTIMENTOS
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Poupança', subCategory: 'Fundo de Emergência' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Poupança', subCategory: 'Imprevistos ActivoBank' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Poupança', subCategory: 'Poupança Pessoal' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Poupança', subCategory: 'Poupança Dodos' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'PPR SGF' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'PPR AR' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'PPR Casa Inv.' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'Criptomoeda' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'Arte' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'PPR Montepio' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'PPR' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'TAFI' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'Ações / ETF' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'Depósito a Prazo' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'ECONOMIA_INVESTIMENTOS' as MajorCategory, category: 'Investimento', subCategory: 'Fundo de Emergência' },

  // SAIDA - CUSTOS VARIAVEIS (Parentalidade)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Enxoval Maternidade' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Vestuário Criança' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Cuidados Criança' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Consulta Pediatria' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Exames Pediatria' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Fisioterapia' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Drenagem' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Medicamentos Pediatria' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'BebéVida' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Parentalidade', subCategory: 'Outros Criança' },

  // SAIDA - CUSTOS FIXOS (Cuidados Pessoais)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Cuidados Pessoais', subCategory: 'Cabeleireiro' },

  // SAIDA - CUSTOS VARIAVEIS (Cuidados Pessoais)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Cuidados Pessoais', subCategory: 'Lentes de Contacto/oculos' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Cuidados Pessoais', subCategory: 'Cuidados de beleza' },

  // SAIDA - CUSTOS VARIAVEIS (Saúde)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Saúde', subCategory: 'Consultas Adulto' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Saúde', subCategory: 'Internamento Adulto' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Saúde', subCategory: 'Exames Adulto' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Saúde', subCategory: 'Dentista Adulto' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Saúde', subCategory: 'Medicamentos Adulto' },

  // SAIDA - CUSTOS VARIAVEIS (Desporto)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'Yoga' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'Ginásio' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'Golfe' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'Padel' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'Futebol' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'Corrida' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desporto', subCategory: 'App Fitness' },

  // SAIDA - CUSTOS VARIAVEIS (Desenvolvimento Pessoal)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desenvolvimento Pessoal', subCategory: 'Terapia' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desenvolvimento Pessoal', subCategory: 'Coaching' },

  // SAIDA - CUSTOS FIXOS (Subscrições)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Subscrições', subCategory: 'Telemóvel' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Subscrições', subCategory: 'Spotify' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Subscrições', subCategory: 'Google One' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Subscrições', subCategory: 'Amazon' },

  // SAIDA - CUSTOS VARIAVEIS (Subscrições)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Subscrições', subCategory: 'Outras Subscrições' },

  // SAIDA - CUSTOS FIXOS (Alimentação)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Alimentação', subCategory: 'Supermercado' },

  // SAIDA - CUSTOS VARIAVEIS (Alimentação)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Alimentação', subCategory: 'Padaria / Pastelaria' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Alimentação', subCategory: 'Take Away' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Alimentação', subCategory: 'Cantina / Trabalho' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Alimentação', subCategory: 'Refeições fora de casa' },

  // SAIDA - TRANSPORTES (mix of CUSTOS_FIXOS and CUSTOS_VARIAVEIS)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Autocaravana Via Verde' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Carro Via Verde' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Estacionamento' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Autocaravana Manutenção' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Mota Combustivel' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Autocaravana Combustivel' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Carro Combustivel' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Autocaravana IUC' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Carro IUC' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Autocaravana Inspeção' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Carro Inspeção' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Mota Seguro' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Carro Seguro' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Carro Manutenção' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Transportes', subCategory: 'Autocaravana Seguro' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Carros Outros' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Transportes', subCategory: 'Transporte Público' },

  // SAIDA - GASTOS SEM CULPA (Prendas)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Prendas', subCategory: 'Prendas Aniversário' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Prendas', subCategory: 'Prendas Casamento' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Prendas', subCategory: 'Prendas Natal' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Prendas', subCategory: 'Prenda Tomas' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Prendas', subCategory: 'Prendas Simão' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Prendas', subCategory: 'Prendas Outros' },

  // SAIDA - GASTOS SEM CULPA (Compras Gerais)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Compras Gerais', subCategory: 'Compras Gerais Outros' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Compras Gerais', subCategory: 'Acessórios' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Compras Gerais', subCategory: 'Coisas para casa' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Compras Gerais', subCategory: 'Vestuário' },

  // SAIDA - GASTOS SEM CULPA (Lazer)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Viagem Croácia' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Milão e Lago de Como' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Toscana' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Algarve 25' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Perú, Bolivia e Chile' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Palma Maiorca' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Férias' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Atividades Lúdicas' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Lazer', subCategory: 'Date Night' },

  // SAIDA - CUSTOS VARIAVEIS (Educação)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Educação', subCategory: 'Formação' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Educação', subCategory: 'Cultura' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Educação', subCategory: 'Livros' },

  // SAIDA - CUSTOS VARIAVEIS (Solidariedade)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Solidariedade', subCategory: 'Seguro voluntariado' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Solidariedade', subCategory: 'Donativo' },

  // SAIDA - CUSTOS FIXOS (Casa)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Prestração' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Ass.Mutualista' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Sol.+Consigo' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Seg.Multiriscos' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Seg.Vida' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Condominio' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Água' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Electricidade' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Gás' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Luz + Gás' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Internet Móvel' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Casa', subCategory: 'Internet' },

  // SAIDA - CUSTOS VARIAVEIS (Casa)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Casa', subCategory: 'Amortização' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Casa', subCategory: 'Casa Manutenção' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Casa', subCategory: 'Casa Obras' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Casa', subCategory: 'Casa Outros' },

  // SAIDA - GASTOS SEM CULPA (Casa)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'GASTOS_SEM_CULPA' as MajorCategory, category: 'Casa', subCategory: 'Casa Decoração' },

  // SAIDA - CUSTOS FIXOS (Axl - Pet)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Axl', subCategory: 'Medicamentos Axl' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Axl', subCategory: 'Seguro Axl' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Axl', subCategory: 'Ração' },

  // SAIDA - CUSTOS VARIAVEIS (Axl - Pet)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Axl', subCategory: 'Creche Axl' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Axl', subCategory: 'Veterinário' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Axl', subCategory: 'Axl Outros' },

  // SAIDA - CUSTOS FIXOS (Conta Conjunta)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_FIXOS' as MajorCategory, category: 'Conta Conjunta', subCategory: 'Mensalidade Dodos' },

  // SAIDA - CUSTOS VARIAVEIS (Outros)
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Multa', subCategory: 'Multa' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Comissões', subCategory: 'Millenium' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Comissões', subCategory: 'MbWay' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Desconhecido', subCategory: 'Desconhecido' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Trabalho', subCategory: 'Despesas a reembolsar' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Trabalho', subCategory: 'Cowork' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Lazer', subCategory: 'Projectos Pessoais' },
  { flow: 'SAIDA' as TransactionFlow, majorCategory: 'CUSTOS_VARIAVEIS' as MajorCategory, category: 'Levantamento', subCategory: 'Levantamento' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create origins
    console.log('Creating origins...');
    for (const origin of origins) {
      await prisma.origin.upsert({
        where: { name: origin.name },
        update: {},
        create: origin,
      });
    }

    // Create banks
    console.log('Creating banks...');
    for (const bank of banks) {
      await prisma.bank.upsert({
        where: { name: bank.name },
        update: {},
        create: bank,
      });
    }

    // Create categories
    console.log('Creating categories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: {
          flow_majorCategory_category_subCategory: {
            flow: category.flow,
            majorCategory: category.majorCategory,
            category: category.category,
            subCategory: category.subCategory,
          },
        },
        update: {},
        create: category,
      });
    }

    // Create a default admin user
    console.log('Creating default admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123!', 12);
    
    await prisma.user.upsert({
      where: { email: 'admin@smartexpense.app' },
      update: {},
      create: {
        email: 'admin@smartexpense.app',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${origins.length} origins`);
    console.log(`Created ${banks.length} banks`);
    console.log(`Created ${categories.length} categories`);
    console.log('Created 1 admin user');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });