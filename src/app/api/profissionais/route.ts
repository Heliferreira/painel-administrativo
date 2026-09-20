import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lista todos os profissionais com contagem de pacientes
export async function GET() {
  try {
    const profissionais = await prisma.profissional.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: { pacientes: true }
        }
      }
    });
    return NextResponse.json(profissionais, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return NextResponse.json({ error: 'Erro ao buscar profissionais' }, { status: 500 });
  }
}

// POST: Cadastra um novo profissional
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, especialidade, contato, disponibilidade } = body;

    if (!nome || !especialidade || !contato) {
      return NextResponse.json({ error: 'Nome, especialidade e contato são obrigatórios.' }, { status: 400 });
    }

    const novoProfissional = await prisma.profissional.create({
      data: {
        nome,
        especialidade,
        contato,
        disponibilidade,
      },
    });

    return NextResponse.json(novoProfissional, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar profissional:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar profissional' }, { status: 500 });
  }
}