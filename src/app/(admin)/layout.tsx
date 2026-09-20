'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  LayoutDashboard, 
  LogOut 
} from 'lucide-react';
import { encerrarSessao } from '@/app/login/actions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/pacientes', icon: Users },
    { name: 'Profissionais', href: '/profissionais', icon: UserCheck },
    { name: 'Encaminhamentos', href: '/encaminhamentos', icon: Calendar },
    { name: 'Financeiro', href: '/financeiro', icon: CreditCard },
  ];

  const handleLogout = async () => {
    try {
      await encerrarSessao();
    } catch (error) {
      // Ignora erro de redirect do Next.js
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar Lateral Roxa */}
      <aside className="w-64 bg-indigo-950 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          {/* Logo / Marca */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-indigo-900">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Acessíveis</h1>
              <p className="text-xs text-indigo-300">Painel de Gestão</p>
            </div>
          </div>

          {/* Menu de Navegação */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-indigo-200 hover:bg-indigo-900/60 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar / Usuário */}
        <div className="border-t border-indigo-900 pt-4 px-3 flex items-center justify-between">
          <div className="text-xs">
            <p className="font-medium text-white">Time Interno</p>
            <p className="text-indigo-400">admin@acessiveis.com</p>
          </div>
          
          {/* BOTÃO DE SAIR COM ONCLICK */}
          <button 
            type="button"
            onClick={handleLogout}
            title="Sair" 
            className="text-indigo-300 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}