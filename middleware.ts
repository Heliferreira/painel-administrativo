import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token_sessao');
  console.log("--> VALOR DO TOKEN NO MIDDLEWARE:", token ? token.value : "COOKIE NÃO ENCONTRADO!");
  
  const pathname = request.nextUrl.pathname;

  // Se tentar acessar o dashboard sem o token, expulsa pro login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se já estiver logado e tentar ir pro login, joga pro dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/pacientes/:path*'],
};