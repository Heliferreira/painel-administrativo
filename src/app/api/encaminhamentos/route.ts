import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lista todos os encaminhamentos
export async function GET() {
  try {
    const encaminhamentos = await prisma.encaminhamento.findMany({
      orderBy: { id: 'desc' },
      include: {
        paciente: {
          select: { id: true, nomeCompleto: true, whatsapp: true }
        },
        profissional: {
          select: { id: true, nome: true, especialidade: true }
        }
      }
    });
    return NextResponse.json(encaminhamentos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar encaminhamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar encaminhamentos' }, { status: 500 });
  }
}

// POST: Cria um novo encaminhamento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pacienteId, profissionalId, observacoes } = body;

    if (!pacienteId || !profissionalId) {
      return NextResponse.json({ error: 'Paciente e Profissional são obrigatórios.' }, { status: 400 });
    }

    const novoEncaminhamento = await prisma.encaminhamento.create({
      data: {
        pacienteId,
        profissionalId,
        observacoes,
        dataConsulta: new Date(), // Preenche com a data atual automaticamente
      },
      include: {
        paciente: true,
        profissional: true
      }
    });

    return NextResponse.json(novoEncaminhamento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar encaminhamento:', error);
    return NextResponse.json({ error: 'Erro ao criar encaminhamento' }, { status: 500 });
  }
}