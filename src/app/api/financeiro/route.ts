import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscamos os pacientes incluindo o valor do plano cadastrado
    const pacientes = await prisma.paciente.findMany({
      orderBy: { nomeCompleto: 'asc' },
      select: {
        id: true,
        nomeCompleto: true,
        status: true,
        whatsapp: true,
        valorPlano: true,
      }
    });

    const total = pacientes.length;
    const inadimplentes = pacientes.filter(p => p.status !== 'EM_DIA').length;
    const adimplentes = total - inadimplentes;

    // Calculamos o MRR Previsto somando o valor real do plano de todos os pacientes ativos/cadastrados
    const mrrPrevisto = pacientes.reduce((acc, p) => acc + Number(p.valorPlano || 0), 0);

    // Calculamos a receita recebida somando apenas o plano dos pacientes que estão adimplentes (EM_DIA)
    const mrrRecebido = pacientes
      .filter(p => p.status === 'EM_DIA')
      .reduce((acc, p) => acc + Number(p.valorPlano || 0), 0);

    return NextResponse.json({
      resumo: {
        mrrPrevisto,
        mrrRecebido,
        adimplentes,
        inadimplentes
      },
      transacoes: pacientes
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Erro ao carregar financeiro' }, { status: 500 });
  }
}