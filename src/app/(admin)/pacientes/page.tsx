'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, EyeOff, X, UserCheck, Trash2, Save, CreditCard, DollarSign } from 'lucide-react';
import { AdicionarClienteModal } from '@/components/AdicionarClienteModal';

interface Paciente {
  id: string;
  nomeCompleto: string;
  email: string;
  whatsapp: string;
  cpf: string;
  dataNascimento: string;
  status: string;
  formaPagamento: string;
  valorPlano?: number | string;
  profissionalResponsavel?: {
    nome: string;
  } | null;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'dados' | 'pagamentos'>('dados');

  // Estado para controlar a visibilidade do CPF (inicia sempre oculta/mascarada)
  const [showCpf, setShowCpf] = useState(false);

  // Estados para o Encaminhamento
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [novoProfissionalId, setNovoProfissionalId] = useState('');
  const [profissionalManual, setProfissionalManual] = useState(''); 
  const [observacaoEncaminhamento, setObservacaoEncaminhamento] = useState('');
  const [carregandoEncaminhamento, setCarregandoEncaminhamento] = useState(false);

  const [editForm, setEditForm] = useState({
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    cpf: '',
    valorPlano: '',
  });

  // Funções de formatação e máscara para o CPF
  const formatarCpf = (value: string) => {
    if (!value) return '';
    const numeros = value.replace(/\D/g, '').slice(0, 11);
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const mascararCpf = (value: string) => {
    const cpfFormatado = formatarCpf(value);
    if (!cpfFormatado) return '';
    return '***.***.***-' + cpfFormatado.slice(-2); 
  };

  const carregarPacientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pacientes');
      if (response.ok) {
        const data = await response.json();
        setPacientes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarProfissionais = async () => {
    try {
      const response = await fetch('/api/profissionais');
      if (response.ok) {
        const data = await response.json();
        setProfissionais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  useEffect(() => {
    carregarPacientes();
    carregarProfissionais();
  }, []);

  const abrirFicha = (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setAbaAtiva('dados');
    setNovoProfissionalId('');
    setProfissionalManual('');
    setObservacaoEncaminhamento('');
    setShowCpf(false); // Sempre abre com o CPF mascarado por segurança
    setEditForm({
      nomeCompleto: paciente.nomeCompleto,
      email: paciente.email,
      whatsapp: paciente.whatsapp,
      cpf: paciente.cpf,
      valorPlano: paciente.valorPlano ? String(paciente.valorPlano) : '',
    });
  };

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      const response = await fetch('/api/pacientes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: novoStatus }),
      });

      if (response.ok) {
        setPacientes(prev =>
          prev.map(p => (p.id === id ? { ...p, status: novoStatus } : p))
        );
      } else {
        alert('Erro ao atualizar o status.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  const handleEncaminhar = async () => {
    if (!pacienteSelecionado) return;

    const isOutro = novoProfissionalId === 'OUTRO';

    if (!novoProfissionalId || (isOutro && !profissionalManual.trim())) {
      alert('Selecione ou informe o nome do profissional para o encaminhamento.');
      return;
    }

    setCarregandoEncaminhamento(true);
    try {
      const response = await fetch(`/api/pacientes/${pacienteSelecionado.id}/encaminhar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profissionalId: isOutro ? null : novoProfissionalId,
          profissionalManual: isOutro ? profissionalManual.trim() : null,
          observacoes: observacaoEncaminhamento,
        }),
      });

      if (response.ok) {
        alert('Paciente encaminhado com sucesso!');
        setNovoProfissionalId('');
        setProfissionalManual('');
        setObservacaoEncaminhamento('');
        carregarPacientes();
        setPacienteSelecionado(null);
      } else {
        const err = await response.json();
        alert(err.error || 'Erro ao realizar encaminhamento.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    } finally {
      setCarregandoEncaminhamento(false);
    }
  };

  const salvarAlteracoes = async () => {
    if (!pacienteSelecionado) return;

    const nomeTrim = editForm.nomeCompleto.trim();
    const cpfLimpo = editForm.cpf.replace(/\D/g, ''); 
    const whatsLimpo = editForm.whatsapp.replace(/\D/g, ''); 

    const partesNome = nomeTrim.split(' ');
    const contemNumero = /\d/.test(nomeTrim);
    if (partesNome.length < 2 || contemNumero) {
      alert('Por favor, informe um nome completo válido (nome e sobrenome, sem números).');
      return;
    }

    if (cpfLimpo.length !== 11) {
      alert('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    if (whatsLimpo.length < 10 || whatsLimpo.length > 11) {
      alert('O WhatsApp deve conter DDD + Número.');
      return;
    }

    try {
      const response = await fetch(`/api/pacientes/${pacienteSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        alert('Alterações salvas com sucesso!');
        setPacienteSelecionado(null);
        carregarPacientes();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao salvar alterações.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  const excluirCliente = async () => {
    if (!pacienteSelecionado) return;

    if (!confirm(`Tem certeza que deseja excluir o cliente ${pacienteSelecionado.nomeCompleto}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pacientes/${pacienteSelecionado.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Cliente excluído com sucesso!');
        setPacienteSelecionado(null);
        carregarPacientes();
      } else {
        alert('Erro ao excluir cliente.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Pacientes</h1>
          <p className="text-sm text-slate-500">Gerencie cadastros, planos e atribuição de profissionais</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors"
        >
          <Plus size={16} />
          Adicionar Cliente
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar paciente por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Carregando dados do banco...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Nome Completo</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Profissional Responsável</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Nenhum paciente cadastrado no banco de dados ainda.
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{paciente.nomeCompleto}</td>
                    <td className="px-6 py-4">
                      <div>{paciente.whatsapp}</div>
                      <div className="text-xs text-slate-400">{paciente.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={paciente.status}
                        onChange={(e) => alterarStatus(paciente.id, e.target.value)}
                        className={`text-xs px-2.5 py-1.5 rounded-full font-medium border-0 cursor-pointer focus:ring-2 focus:ring-purple-500 ${
                          paciente.status === 'EM_DIA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : paciente.status === 'ATRASADO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="EM_DIA">Em Dia</option>
                        <option value="ATRASADO">Atrasado</option>
                        <option value="INADIMPLENTE">Inadimplente</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <UserCheck size={14} className="text-purple-600" />
                        {paciente.profissionalResponsavel?.nome || 'Sem profissional atribuído'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => abrirFicha(paciente)}
                        className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                        title="Ver Ficha Detalhada"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AdicionarClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={carregarPacientes}
      />

      {/* Drawer da Ficha Detalhada com Abas */}
      {pacienteSelecionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-bold text-slate-800">Ficha do Cliente</h2>
                <button 
                  onClick={() => setPacienteSelecionado(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Seletor de Abas */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setAbaAtiva('dados')}
                  className={`flex-1 pb-2 text-xs font-semibold uppercase border-b-2 transition-colors ${
                    abaAtiva === 'dados' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Dados Pessoais
                </button>
                <button
                  onClick={() => setAbaAtiva('pagamentos')}
                  className={`flex-1 pb-2 text-xs font-semibold uppercase border-b-2 transition-colors ${
                    abaAtiva === 'pagamentos' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Histórico de Pagamentos
                </button>
              </div>

              {abaAtiva === 'dados' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">Nome Completo</label>
                    <input 
                      type="text" 
                      value={editForm.nomeCompleto}
                      onChange={(e) => setEditForm({ ...editForm, nomeCompleto: e.target.value })}
                      className="w-full mt-1 p-2 bg-slate-50 border rounded-lg text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">E-mail</label>
                    <input 
                      type="email" 
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full mt-1 p-2 bg-slate-50 border rounded-lg text-sm text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">CPF</label>
                      <div className="relative flex items-center mt-1">
                        <input 
                          type="text" 
                          value={
                            showCpf 
                              ? formatarCpf(editForm.cpf) 
                              : mascararCpf(editForm.cpf)
                          }
                          onChange={(e) => {
                            const apenasNums = e.target.value.replace(/\D/g, '').slice(0, 11);
                            setEditForm({ ...editForm, cpf: apenasNums });
                          }}
                          placeholder="000.000.000-00"
                          className="w-full p-2 pr-10 bg-slate-50 border rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCpf(!showCpf)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                          title={showCpf ? "Ocultar CPF" : "Mostrar CPF"}
                        >
                          {showCpf ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">WhatsApp</label>
                      <input 
                        type="text" 
                        value={editForm.whatsapp}
                        onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                        className="w-full mt-1 p-2 bg-slate-50 border rounded-lg text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">Valor do Plano (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editForm.valorPlano}
                      onChange={(e) => setEditForm({ ...editForm, valorPlano: e.target.value })}
                      className="w-full mt-1 p-2 bg-slate-50 border rounded-lg text-sm text-slate-800 font-semibold text-purple-600"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Bloco de Encaminhamento com a opção Outro */}
                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                    <label className="text-xs font-semibold uppercase text-slate-500">Encaminhar para Profissional</label>
                    <select
                      value={novoProfissionalId}
                      onChange={(e) => setNovoProfissionalId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                    >
                      <option value="">Selecione um profissional...</option>
                      {profissionais.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nome}
                        </option>
                      ))}
                      <option value="OUTRO">Outro (Digitar manualmente)</option>
                    </select>

                    {novoProfissionalId === 'OUTRO' && (
                      <input
                        type="text"
                        placeholder="Digite o nome do profissional..."
                        value={profissionalManual}
                        onChange={(e) => setProfissionalManual(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 animate-fadeIn"
                      />
                    )}

                    <textarea
                      placeholder="Observações do encaminhamento (opcional)..."
                      value={observacaoEncaminhamento}
                      onChange={(e) => setObservacaoEncaminhamento(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 resize-none h-20"
                    />

                    <button
                      onClick={handleEncaminhar}
                      disabled={carregandoEncaminhamento}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {carregandoEncaminhamento ? 'Encaminhando...' : 'Confirmar Encaminhamento'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Forma Cadastrada</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <CreditCard size={16} className="text-purple-600" />
                        {pacienteSelecionado.formaPagamento}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 font-medium rounded-full">
                      Ativo
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">Histórico de Ciclos</span>
                    <div className="border rounded-lg divide-y divide-slate-100 text-sm">
                      <div className="p-3 flex justify-between items-center bg-slate-50/50">
                        <div>
                          <p className="font-medium text-slate-800">Ciclo Atual</p>
                          <p className="text-xs text-slate-400">Vencimento recente</p>
                          <p className="text-xs font-semibold text-purple-600 mt-1 flex items-center gap-1">
                            <DollarSign size={13} />
                            R$ {Number(pacienteSelecionado.valorPlano || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          pacienteSelecionado.status === 'EM_DIA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pacienteSelecionado.status === 'EM_DIA' ? 'Pago / Em Dia' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t flex flex-col gap-3">
              {abaAtiva === 'dados' && (
                <button 
                  onClick={salvarAlteracoes}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save size={16} />
                  Salvar Alterações
                </button>
              )}
              <button 
                onClick={excluirCliente}
                className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}