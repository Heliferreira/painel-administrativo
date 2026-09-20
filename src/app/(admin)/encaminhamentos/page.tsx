'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Calendar, User, Stethoscope, FileText } from 'lucide-react';

interface Paciente {
  id: string;
  nomeCompleto: string;
}

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

interface Encaminhamento {
  id: string;
  dataEncaminhamento: string;
  sessoes: number;
  status: string;
  observacoes?: string;
  paciente: Paciente;
  profissional: Profissional;
}

export default function EncaminhamentosPage() {
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    pacienteId: '',
    profissionalId: '',
    sessoes: '1',
    observacoes: '',
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resEnc, resPac, resProf] = await Promise.all([
        fetch('/api/encaminhamentos'),
        fetch('/api/pacientes'),
        fetch('/api/profissionais')
      ]);

      if (resEnc.ok) setEncaminhamentos(await resEnc.ok ? await resEnc.json() : []);
      // Ajuste caso suas rotas de pacientes/profissionais retornem estruturas diretas
      if (resPac.ok) {
        const dataPac = await resPac.json();
        setPacientes(Array.isArray(dataPac) ? dataPac : dataPac.pacientes || []);
      }
      if (resProf.ok) {
        setProfissionais(await resProf.json());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pacienteId || !form.profissionalId) {
      alert('Selecione o paciente e o profissional.');
      return;
    }

    try {
      const response = await fetch('/api/encaminhamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert('Encaminhamento realizado com sucesso!');
        setForm({ pacienteId: '', profissionalId: '', sessoes: '1', observacoes: '' });
        setIsModalOpen(false);
        carregarDados();
      } else {
        const err = await response.json();
        alert(err.error || 'Erro ao registrar encaminhamento.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  const encaminhamentosFiltrados = encaminhamentos.filter(item =>
    item.paciente?.nomeCompleto?.toLowerCase().includes(busca.toLowerCase()) ||
    item.profissional?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Encaminhamentos</h1>
          <p className="text-sm text-slate-500">Controle de pacientes vinculados aos profissionais da clínica</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors"
        >
          <Plus size={16} />
          Novo Encaminhamento
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome do paciente ou profissional..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Carregando encaminhamentos...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Profissional Responsável</th>
                <th className="px-6 py-4">Sessões</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {encaminhamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Nenhum encaminhamento registrado.
                  </td>
                </tr>
              ) : (
                encaminhamentosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                      <User size={16} className="text-purple-600" />
                      {item.paciente?.nomeCompleto || 'Paciente não encontrado'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium flex items-center gap-1.5">
                        <Stethoscope size={14} className="text-purple-500" />
                        {item.profissional?.nome || 'Profissional não encontrado'}
                      </div>
                      <span className="text-xs text-slate-400">{item.profissional?.especialidade}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.sessoes} sessões
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(item.dataEncaminhamento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {item.status}
                      </span>
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
            <h2 className="text-lg font-bold text-slate-800">Novo Encaminhamento</h2>
            
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Paciente</label>
                <select
                  value={form.pacienteId}
                  onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  required
                >
                  <option value="">Selecione o paciente...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Profissional</label>
                <select
                  value={form.profissionalId}
                  onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  required
                >
                  <option value="">Selecione o profissional...</option>
                  {profissionais.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.nome} ({prof.especialidade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Quantidade de Sessões</label>
                <input
                  type="number"
                  min="1"
                  value={form.sessoes}
                  onChange={(e) => setForm({ ...form, sessoes: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Observações (Opcional)</label>
                <textarea
                  placeholder="Detalhes sobre o encaminhamento..."
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                  rows={3}
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