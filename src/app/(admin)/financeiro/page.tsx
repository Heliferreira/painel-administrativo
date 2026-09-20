'use client';

import React, { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface PacienteFinanceiro {
  id: string;
  nomeCompleto: string;
  status: string;
  whatsapp: string;
}

interface FinanceiroData {
  resumo: {
    mrrPrevisto: number;
    mrrRecebido: number;
    adimplentes: number;
    inadimplentes: number;
  };
  transacoes: PacienteFinanceiro[];
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const carregarFinanceiro = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/financeiro');
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  const transacoesFiltradas = data?.transacoes.filter(t =>
    t.nomeCompleto.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Controle Financeiro</h1>
        <p className="text-sm text-slate-500">Acompanhamento de receitas, mensalidades e status de pagamentos</p>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">MRR Previsto (Total)</span>
            <DollarSign size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            R$ {data?.resumo.mrrPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
          <p className="text-xs text-slate-400">Baseado no total de pacientes ativos</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Confirmada (Recebido)</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            R$ {data?.resumo.mrrRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
          <p className="text-xs text-slate-400">{data?.resumo.adimplentes || 0} pacientes adimplentes</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pendências / Em Aberto</span>
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {data?.resumo.inadimplentes || 0} pacientes
          </div>
          <p className="text-xs text-slate-400">Requer cobrança ou atenção</p>
        </div>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar paciente pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Carregando dados financeiros...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Status da Mensalidade</th>
                <th className="px-6 py-4">Contato (WhatsApp)</th>
                <th className="px-6 py-4 text-right">Ação de Cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nomeCompleto}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.status === 'EM_DIA' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.whatsapp}</td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`https://wa.me/55${item.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(item.nomeCompleto)},%20passando%20para%20lembrar%20sobre%20a%20sua%20mensalidade%20na%20clínica.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Enviar Cobrança
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}