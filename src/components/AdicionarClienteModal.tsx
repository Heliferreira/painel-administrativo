'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdicionarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdicionarClienteModal({ isOpen, onClose, onSuccess }: AdicionarClienteModalProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  // Estado para controlar quais campos tiveram erro de preenchimento
  const [camposComErro, setCamposComErro] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    cpf: '',
    dataNascimento: '',
    formaPagamento: 'PIX',
    profissionalResponsavel: '',
    valorPlano: '',
  });

  // Reseta o formulário, erros e marcações sempre que o modal fechar ou abrir
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nomeCompleto: '',
        email: '',
        whatsapp: '',
        cpf: '',
        dataNascimento: '',
        formaPagamento: 'PIX',
        profissionalResponsavel: '',
        valorPlano: '',
      });
      setErro('');
      setCamposComErro({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const novosErros: { [key: string]: boolean } = {};

    // Checa cada campo individualmente e marca se estiver vazio
    if (!formData.nomeCompleto.trim()) novosErros.nomeCompleto = true;
    if (!formData.email.trim()) novosErros.email = true;
    if (!formData.whatsapp.trim()) novosErros.whatsapp = true;
    if (!formData.cpf.trim()) novosErros.cpf = true;
    if (!formData.dataNascimento) novosErros.dataNascimento = true;
    if (!formData.formaPagamento.trim()) novosErros.formaPagamento = true;
    if (!formData.profissionalResponsavel.trim()) novosErros.profissionalResponsavel = true;
    if (!formData.valorPlano.trim()) novosErros.valorPlano = true;

    if (Object.keys(novosErros).length > 0) {
      setCamposComErro(novosErros);
      setErro('Por favor, preencha todos os campos obrigatórios, incluindo o valor do plano.');
      return;
    }

    // Validação estrita do CPF (apenas números, deve ter 11 dígitos)
    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setCamposComErro({ cpf: true });
      setErro('O CPF deve conter exatamente 11 números.');
      return;
    }

    // Validação do WhatsApp (mínimo de 10 dígitos com DDD)
    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');
    if (whatsappLimpo.length < 10) {
      setCamposComErro({ whatsapp: true });
      setErro('O WhatsApp deve conter um número válido com DDD (mínimo 10 dígitos).');
      return;
    }

    // Se passou de tudo, limpa os erros visuais
    setCamposComErro({});
    setLoading(true);

    try {
      const response = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cpf: cpfLimpo,
          whatsapp: whatsappLimpo,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao salvar cliente no banco.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro de conexão ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para definir a classe da borda dinamicamente
  const getInputClass = (campo: string) => {
    const baseClass = "w-full mt-1 p-2 border rounded-lg text-sm bg-slate-50 text-slate-800 outline-none transition-colors";
    if (camposComErro[campo]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500`;
    }
    return `${baseClass} border-slate-300 focus:border-purple-500`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800">Adicionar Novo Cliente</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Nome Completo *</label>
            <input
              type="text"
              autoComplete="off"
              value={formData.nomeCompleto}
              onChange={(e) => {
                setFormData({ ...formData, nomeCompleto: e.target.value });
                if (camposComErro.nomeCompleto) setCamposComErro({ ...camposComErro, nomeCompleto: false });
              }}
              className={getInputClass('nomeCompleto')}
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">E-mail *</label>
              <input
                type="email"
                autoComplete="off"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (camposComErro.email) setCamposComErro({ ...camposComErro, email: false });
                }}
                className={getInputClass('email')}
                placeholder="exemplo@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">WhatsApp *</label>
              <input
                type="text"
                autoComplete="off"
                value={formData.whatsapp}
                onChange={(e) => {
                  setFormData({ ...formData, whatsapp: e.target.value });
                  if (camposComErro.whatsapp) setCamposComErro({ ...camposComErro, whatsapp: false });
                }}
                className={getInputClass('whatsapp')}
                placeholder="(99) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase text-slate-500">CPF *</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formData.cpf.replace(/\D/g, '').length}/11 dígitos
                </span>
              </div>
              <input
                type="text"
                autoComplete="off"
                value={formData.cpf}
                onChange={(e) => {
                  setFormData({ ...formData, cpf: e.target.value });
                  if (camposComErro.cpf) setCamposComErro({ ...camposComErro, cpf: false });
                }}
                className={`${getInputClass('cpf')} font-mono`}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Data de Nascimento *</label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => {
                  setFormData({ ...formData, dataNascimento: e.target.value });
                  if (camposComErro.dataNascimento) setCamposComErro({ ...camposComErro, dataNascimento: false });
                }}
                className={getInputClass('dataNascimento')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Forma de Pagamento *</label>
              <select
                value={formData.formaPagamento}
                onChange={(e) => {
                  setFormData({ ...formData, formaPagamento: e.target.value });
                  if (camposComErro.formaPagamento) setCamposComErro({ ...camposComErro, formaPagamento: false });
                }}
                className={getInputClass('formaPagamento')}
              >
                <option value="PIX">Pix</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Valor do Plano (R$) *</label>
              <input
                type="number"
                step="0.01"
                autoComplete="off"
                value={formData.valorPlano}
                onChange={(e) => {
                  setFormData({ ...formData, valorPlano: e.target.value });
                  if (camposComErro.valorPlano) setCamposComErro({ ...camposComErro, valorPlano: false });
                }}
                className={getInputClass('valorPlano')}
                placeholder="150.00"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Profissional Responsável *</label>
            <input
              type="text"
              autoComplete="off"
              value={formData.profissionalResponsavel}
              onChange={(e) => {
                setFormData({ ...formData, profissionalResponsavel: e.target.value });
                if (camposComErro.profissionalResponsavel) setCamposComErro({ ...camposComErro, profissionalResponsavel: false });
              }}
              className={getInputClass('profissionalResponsavel')}
              placeholder="Digite o nome do profissional..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}