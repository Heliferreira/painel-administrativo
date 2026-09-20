'use client';

import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Calendar, RefreshCcw, DollarSign, ArrowUpRight } from 'lucide-react';

interface DashboardData {
  totalPacientes: number;
  taxaInadimplencia: {
    quantidade: number;
    porcentagem: number;
  };
  totalConsultasMes: number;
  taxaRecorrencia: number;
  pacientesAtencao: Array<{
    id: string;
    nomeCompleto: string;
    status: string;
    whatsapp: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando indicadores do painel...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral e indicadores principais da clínica</p>
      </div>

      {/* 4 Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Clientes Ativos</span>
            <Users size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {data?.totalPacientes || 0}
          </div>
          <p className="text-xs text-slate-400">Total de pacientes cadastrados</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa de Inadimplência</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {data?.taxaInadimplencia.porcentagem || 0}%
          </div>
          <p className="text-xs text-slate-400">{data?.taxaInadimplencia.quantidade || 0} pacientes afetados</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Consultas no Mês</span>
            <Calendar size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {data?.totalConsultasMes || 0}
          </div>
          <p className="text-xs text-slate-400">Total de encaminhamentos/consultas</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa de Recorrência</span>
            <RefreshCcw size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {data?.taxaRecorrencia || 100}%
          </div>
          <p className="text-xs text-slate-400">Retenção de assinaturas em dia</p>
        </div>
      </div>

      {/* Lista de Clientes que Precisam de Atenção */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Clientes que Precisam de Atenção</h2>
          <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-full">
            Atrasados / Inadimplentes / Bloqueados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nome do Paciente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.pacientesAtencao.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Nenhum cliente precisando de atenção no momento. Tudo em ordem!
                  </td>
                </tr>
              ) : (
                data?.pacientesAtencao.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{paciente.nomeCompleto}</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {paciente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{paciente.whatsapp}</td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`https://wa.me/55${paciente.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Contatar
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}