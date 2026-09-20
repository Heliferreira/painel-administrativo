import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Atualiza os dados do paciente pelo ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const valorNumerico = body.valorPlano !== undefined ? parseFloat(body.valorPlano) : undefined;

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: String(id) },
      data: {
        nomeCompleto: body.nomeCompleto,
        cpf: body.cpf,
        whatsapp: body.whatsapp,
        email: body.email,
        ...(valorNumerico !== undefined && { valorPlano: valorNumerico }),
      },
    });

    return NextResponse.json(pacienteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
  }
}

// DELETE: Remove o paciente pelo ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await prisma.paciente.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ message: 'Excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    return NextResponse.json({ error: 'Erro ao excluir paciente' }, { status: 500 });
  }
}