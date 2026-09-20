'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { autenticarUsuario } from './actions';

export default function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('🔴 CLIQUEI NO BOTAO DE LOGIN');
    e.preventDefault();
    setErro('');
    setLoading(true);

    // Guarda a referência do form ANTES de qualquer await,
    // pois o SyntheticEvent do React é reciclado após o handler.
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await autenticarUsuario(formData);

      if (res && res.sucesso) {
        console.log('[DEBUG] Login OK, tentando salvar credencial...');

        // Pede explicitamente ao navegador para salvar/atualizar a credencial.
        // Suportado por Chrome, Edge e Opera (Credential Management API).
        // Precisa rodar com o form ainda preenchido no DOM, antes de navegar.
        if (typeof window !== 'undefined' && 'PasswordCredential' in window) {
          console.log('[DEBUG] PasswordCredential suportado, criando credencial...');
          try {
            const cred = new (window as any).PasswordCredential(form);
            console.log('[DEBUG] Credencial criada:', cred);
            await navigator.credentials.store(cred);
            console.log('[DEBUG] navigator.credentials.store() concluído com sucesso');
          } catch (credErr) {
            // Não é crítico: se falhar, o login segue normalmente.
            console.warn('[DEBUG] Não foi possível salvar a credencial:', credErr);
          }
        } else {
          console.log('[DEBUG] PasswordCredential NÃO suportado neste contexto');
        }

        router.push('/dashboard');
        router.refresh();
      } else {
        setErro(res?.erro || 'Erro ao realizar login.');
      }
    } catch (err) {
      setErro('Ocorreu um erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Controle Interno</h1>
          <p className="text-sm text-slate-500 mt-1">Acesse o painel de pacientes</p>
        </div>

        {erro && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" method="post">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">E-mail</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                name="email"
                id="email"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Senha</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                name="senha"
                id="senha"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                name="manterLogogado"
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span>Manter-me conectado</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}