'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, UserCheck, Stethoscope, Phone } from 'lucide-react';

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  contato: string;
  disponibilidade?: string;
  _count?: {
    pacientes: number;
  };
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    especialidade: '',
    contato: '',
    disponibilidade: '',
  });

  const carregarProfissionais = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profissionais');
      if (response.ok) {
        const data = await response.json();
        setProfissionais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProfissionais();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.especialidade || !form.contato) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    try {
      const response = await fetch('/api/profissionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert('Profissional cadastrado com sucesso!');
        setForm({ nome: '', especialidade: '', contato: '', disponibilidade: '' });
        setIsModalOpen(false);
        carregarProfissionais();
      } else {
        const err = await response.json();
        alert(err.error || 'Erro ao cadastrar profissional.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  const excluirProfissional = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente excluir o profissional ${nome}?`)) return;

    try {
      const response = await fetch(`/api/profissionais/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Profissional excluído com sucesso!');
        carregarProfissionais();
      } else {
        const err = await response.json();
        alert(err.error || 'Erro ao excluir.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  const profissionaisFiltrados = profissionais.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Profissionais</h1>
          <p className="text-sm text-slate-500">Médicos, terapeutas e parceiros cadastrados na clínica</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors"
        >
          <Plus size={16} />
          Novo Profissional
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou especialidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Carregando profissionais...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Especialidade</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Disponibilidade</th>
                <th className="px-6 py-4">Pacientes Vinculados</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profissionaisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Nenhum profissional cadastrado.
                  </td>
                </tr>
              ) : (
                profissionaisFiltrados.map((prof) => (
                  <tr key={prof.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                      <Stethoscope size={16} className="text-purple-600" />
                      {prof.nome}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {prof.especialidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-1.5 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      {prof.contato}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {prof.disponibilidade || 'Não informada'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <UserCheck size={14} className="text-purple-600" />
                        {prof._count?.pacientes || 0} pacientes
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
  onClick={() => excluirProfissional(prof.id, prof.nome)}
  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
  title="Excluir Profissional"
>
  <Trash2 size={18} />
</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Cadastrar Novo Profissional</h2>
            
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Lucas Mendes"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Especialidade</label>
                <input
                  type="text"
                  placeholder="Ex: Psicologia / Psiquiatria"
                  value={form.especialidade}
                  onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Contato (WhatsApp / Telefone)</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Disponibilidade (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Segundas e Quartas, 14h às 18h"
                  value={form.disponibilidade}
                  onChange={(e) => setForm({ ...form, disponibilidade: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}