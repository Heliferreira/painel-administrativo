import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalPacientes = await prisma.paciente.count();

    const inadimplentesCount = await prisma.paciente.count({
      where: {
        status: {
          in: ['ATRASADO', 'INADIMPLENTE', 'BLOQUEADO', 'CANCELADO']
        }
      }
    });

    const taxaInadimplenciaPorcentagem = totalPacientes > 0 
      ? Number(((inadimplentesCount / totalPacientes) * 100).toFixed(1))
      : 0;

    // Total de encaminhamentos/consultas gerais no período
    const totalConsultasMes = await prisma.encaminhamento.count();

    // Pacientes que precisam de atenção (status diferente de EM_DIA)
    const pacientesAtencao = await prisma.paciente.findMany({
      where: {
        status: {
          in: ['ATRASADO', 'INADIMPLENTE', 'BLOQUEADO', 'CANCELADO']
        }
      },
      select: {
        id: true,
        nomeCompleto: true,
        status: true,
        whatsapp: true,
      },
      take: 10
    });

    return NextResponse.json({
      totalPacientes,
      taxaInadimplencia: {
        quantidade: inadimplentesCount,
        porcentagem: taxaInadimplenciaPorcentagem
      },
      totalConsultasMes,
      taxaRecorrencia: 100 - taxaInadimplenciaPorcentagem, // Estimativa baseada na adimplência
      pacientesAtencao
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 });
  }
}