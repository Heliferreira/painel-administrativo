import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpa registros anteriores para evitar duplicados no seed
  await prisma.paciente.deleteMany();
  await prisma.profissional.deleteMany();

  // 1. Cria profissionais parceiros de teste
  const prof1 = await prisma.profissional.create({
    data: {
      nome: 'Dra. Camila Rocha',
      especialidade: 'Psicologia',
      contato: '(11) 97777-8888',
    },
  });

  const prof2 = await prisma.profissional.create({
    data: {
      nome: 'Dr. Lucas Mendes',
      especialidade: 'Psiquiatria',
      contato: '(11) 96666-5555',
    },
  });

  // 2. Cria pacientes fictícios de teste
  await prisma.paciente.createMany({
    data: [
      {
        nomeCompleto: 'Ana Silva',
        email: 'ana.silva@email.com',
        whatsapp: '(11) 98765-4321',
        cpf: '123.456.789-00',
        dataNascimento: new Date('1992-05-14'),
        status: 'EM_DIA',
        formaPagamento: 'PIX',
        profissionalResponsavelId: prof1.id,
      },
      {
        nomeCompleto: 'Carlos Eduardo',
        email: 'carlos@email.com',
        whatsapp: '(21) 99887-6655',
        cpf: '987.654.321-11',
        dataNascimento: new Date('1988-11-23'),
        status: 'ATRASADO',
        formaPagamento: 'CARTAO_CREDITO',
        profissionalResponsavelId: null,
      },
      {
        nomeCompleto: 'Mariana Costa',
        email: 'mariana.costa@email.com',
        whatsapp: '(31) 97123-4455',
        cpf: '456.789.123-22',
        dataNascimento: new Date('1995-03-08'),
        status: 'INADIMPLENTE',
        formaPagamento: 'PIX',
        profissionalResponsavelId: prof2.id,
      },
    ],
  });

  console.log('Seed executado com sucesso! Dados fictícios inseridos.');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });