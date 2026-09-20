import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Realiza o encaminhamento do paciente para um novo profissional e registra no histórico
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pacienteId = resolvedParams.id;
    const body = await request.json();
    const { profissionalId, profissionalManual, observacoes } = body;

    if (!profissionalId && !profissionalManual) {
      return NextResponse.json({ error: 'O profissional responsável é obrigatório.' }, { status: 400 });
    }

    // Se for preenchimento manual, limpamos o ID e podemos salvar a observação/nome manual
    if (profissionalManual) {
      const pacienteAtualizado = await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          profissionalResponsavelId: null,
        },
      });

      // Como é externo/manual, criamos uma observação detalhada sem quebrar a tabela de relações
      const obsFinal = `Profissional externo/manual: ${profissionalManual}. ${observacoes || ''}`;

      return NextResponse.json({ pacienteAtualizado, aviso: obsFinal }, { status: 201 });
    }

    // Se for um profissional cadastrado do sistema, fazemos o fluxo normal com histórico
    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: pacienteId },
      data: {
        profissionalResponsavelId: profissionalId,
      },
    });

    const novoEncaminhamento = await prisma.encaminhamento.create({
      data: {
        pacienteId: pacienteId,
        profissionalId: profissionalId,
        observacoes: observacoes || 'Troca de profissional responsável',
        dataConsulta: new Date(),
      },
      include: {
        profissional: true,
      },
    });

    return NextResponse.json({ pacienteAtualizado, novoEncaminhamento }, { status: 201 });
  } catch (error) {
    console.error('Erro ao realizar encaminhamento:', error);
    return NextResponse.json({ error: 'Erro ao processar o encaminhamento' }, { status: 500 });
  }
}