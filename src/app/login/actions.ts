'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function autenticarUsuario(formData: FormData) {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;
  const manterLogogado = formData.get('manterLogogado') === 'on';

  if (!email || !senha) {
    return { sucesso: false, erro: 'Preencha todos os campos.' };
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return { sucesso: false, erro: 'E-mail ou senha incorretos.' };
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return { sucesso: false, erro: 'E-mail ou senha incorretos.' };
    }

    // Se "manter conectado" estiver marcado, define 30 dias. Senão, define 1 dia (evita expirar ao fechar a aba/navegador por acidente).
    const tempoExpiracao = manterLogogado ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    const cookieStore = await cookies();
    cookieStore.set('token_sessao', usuario.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tempoExpiracao,
      path: '/',
    });

    return { sucesso: true };
  } catch (error) {
    console.error('Erro no login:', error);
    return { sucesso: false, erro: 'Ocorreu um erro interno no servidor.' };
  }
}

export async function encerrarSessao() {
  const cookieStore = await cookies();
  cookieStore.delete('token_sessao');
}