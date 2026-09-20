'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Paciente {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  status: string;
  profissionalResponsavel?: string;
  valorPlano?: number | string;
}

interface PacienteDrawerProps {
  paciente: Paciente | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPaciente: Paciente) => void;
}

export function PacienteDrawer({ paciente, isOpen, onClose, onSave }: PacienteDrawerProps) {
  const [formData, setFormData] = useState<Paciente>({
    id: '',
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    status: 'ATIVO',
    profissionalResponsavel: '',
    valorPlano: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (paciente) {
      setFormData(paciente);
      setIsEditing(false);
    }
  }, [paciente]);

  if (!isOpen || !paciente) return null;

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">Ficha do Paciente</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-lg">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Nome Completo</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.nomeCompleto || ''}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                className="w-full mt-1 p-2 border rounded bg-gray-50 disabled:bg-transparent text-sm text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">E-mail</label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 p-2 border rounded bg-gray-50 disabled:bg-transparent text-sm text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">WhatsApp / Telefone</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.whatsapp || formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full mt-1 p-2 border rounded bg-gray-50 disabled:bg-transparent text-sm text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Valor do Plano (R$)</label>
              <input
                type="number"
                step="0.01"
                disabled={!isEditing}
                value={formData.valorPlano ?? ''}
                onChange={(e) => setFormData({ ...formData, valorPlano: e.target.value })}
                className="w-full mt-1 p-2 border rounded bg-gray-50 disabled:bg-transparent text-sm text-gray-800 font-semibold text-purple-600"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Profissional Responsável</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.profissionalResponsavel || ''}
                onChange={(e) => setFormData({ ...formData, profissionalResponsavel: e.target.value })}
                className="w-full mt-1 p-2 border rounded bg-gray-50 disabled:bg-transparent text-sm text-gray-800"
                placeholder="Sem profissional atribuído"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex gap-3">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex-1 bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700">Salvar</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium">Cancelar</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700">Editar Cadastro</button>
          )}
        </div>
      </div>
    </div>
  );
}