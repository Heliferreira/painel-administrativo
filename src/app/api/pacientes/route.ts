import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lista todos os pacientes
export async function GET() {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: {
        profissionalResponsavel: true,
        transacoes: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return NextResponse.json(pacientes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 });
  }
}

// POST: Cadastra um novo paciente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nomeCompleto, 
      cpf, 
      dataNascimento, 
      whatsapp, 
      email, 
      formaPagamento, 
      profissionalResponsavel, 
      valorPlano 
    } = body;

    let profissionalId = null;

    if (profissionalResponsavel && profissionalResponsavel.trim() !== '') {
      const nomeProf = profissionalResponsavel.trim();
      
      let prof = await prisma.profissional.findFirst({
        where: {
          nome: {
            equals: nomeProf,
            mode: 'insensitive',
          },
        },
      });

      if (!prof) {
        prof = await prisma.profissional.create({
          data: {
            nome: nomeProf,
            especialidade: 'Geral / Não especificada',
            contato: '(00) 00000-0000',
          },
        });
      }

      profissionalId = prof.id;
    }

    const valorNumerico = valorPlano ? parseFloat(valorPlano) : 0;

    const novoPaciente = await prisma.paciente.create({
      data: {
        nomeCompleto,
        cpf,
        dataNascimento: new Date(dataNascimento),
        whatsapp,
        email,
        formaPagamento: formaPagamento || 'PIX',
        status: 'EM_DIA',
        valorPlano: valorNumerico,
        profissionalResponsavelId: profissionalId,
        transacoes: {
          create: {
            valor: valorNumerico,
            status: 'PAGO',
            vencimento: new Date(),
            dataPagamento: new Date(),
          }
        }
      },
      include: {
        transacoes: true,
      }
    });

    return NextResponse.json(novoPaciente, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar paciente:', error);

    // Tratamento específico para campos únicos duplicados do Prisma (P2002)
    if (error.code === 'P2002') {
      const campoDuplicado = error.meta?.target?.[0];
      if (campoDuplicado === 'email') {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado para outro paciente.' }, { status: 400 });
      }
      if (campoDuplicado === 'cpf') {
        return NextResponse.json({ error: 'Este CPF já está cadastrado no sistema.' }, { status: 400 });
      }
      return NextResponse.json({ error: `O campo '${campoDuplicado || 'informado'}' já existe no sistema.` }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erro ao criar paciente' }, { status: 500 });
  }
}

// PATCH: Atualiza o status do paciente
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(pacienteAtualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}