export const mockPacientes = [
  {
    id: '1',
    nomeCompleto: 'Ana Silva',
    email: 'ana.silva@email.com',
    whatsapp: '(11) 98765-4321',
    cpf: '123.456.789-00',
    dataNascimento: '1992-05-14',
    status: 'EM_DIA',
    formaPagamento: 'PIX',
    profissionalResponsavel: {
      nome: 'Dra. Camila Rocha',
      especialidade: 'Psicologia'
    }
  },
  {
    id: '2',
    nomeCompleto: 'Carlos Eduardo',
    email: 'carlos@email.com',
    whatsapp: '(21) 99887-6655',
    cpf: '987.654.321-11',
    dataNascimento: '1988-11-23',
    status: 'ATRASADO',
    formaPagamento: 'CARTAO_CREDITO',
    profissionalResponsavel: null
  },
  {
    id: '3',
    nomeCompleto: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    whatsapp: '(31) 97123-4455',
    cpf: '456.789.123-22',
    dataNascimento: '1995-03-08',
    status: 'INADIMPLENTE',
    formaPagamento: 'PIX',
    profissionalResponsavel: {
      nome: 'Dr. Lucas Mendes',
      especialidade: 'Psiquiatria'
    }
  }
];