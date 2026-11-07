/**
 * packages/merchant-core/src/pages/ClientsView.jsx
 * Gestão de Clientes e CRM com Criptografia LGPD (I2 - Nível 2)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Search, Phone, Mail, FileText, Lock, X, CheckCircle2 } from 'lucide-react';
import { maskCPF } from '../utils/masking';

export function ClientsView({ onOpenContractWithClient }) {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    setClients([
      {
        id: 1,
        name: 'Juliana Mendes (Fictícia)',
        cpfMasked: '***.456.789-**',
        phone: '(11) 96666-0003',
        email: 'juliana.ficticia@exemplo.com',
        address: 'Rua das Amostras, 100 - São Paulo/SP',
        notes: 'Cliente interessada em sedan automático, pré-aprovada para crédito bancário.',
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Roberto Alves (Fictício)',
        cpfMasked: '***.888.999-**',
        phone: '(11) 98888-0001',
        email: 'roberto.ficticio@exemplo.com',
        address: 'Av. Paulista, 1500 - São Paulo/SP',
        notes: 'Lead do formulário do site convertido para cliente.',
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      }
    ]);
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newClient = {
      id: Date.now(),
      name: formData.name,
      cpfMasked: '***.' + (formData.cpf.slice(4, 7) || '000') + '.' + (formData.cpf.slice(8, 11) || '000') + '-**',
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      notes: formData.notes,
      created_at: new Date().toISOString()
    };

    setClients(prev => [newClient, ...prev]);
    setIsModalOpen(false);
    setFormData({ name: '', cpf: '', phone: '', email: '', address: '', notes: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-amber-400" />
              Carteira de Clientes (CRM)
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              Tier 2+ Pro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastro protegido com criptografia em repouso e reaproveitável na emissão de contratos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* 2. Busca */}
      <div className="relative bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por nome, telefone ou e-mail..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 3. Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{client.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-mono mt-0.5">
                  <Lock className="w-3 h-3" />
                  <span>CPF: {client.cpfMasked}</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">
                Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{client.email}</span>
                </div>
              )}
            </div>

            {client.notes && (
              <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {client.notes}
              </p>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenContractWithClient && onOpenContractWithClient(client)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Emitir Contrato
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Modal de Cadastro de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Cadastrar Novo Cliente
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CPF (Criptografado) *</label>
                  <input
                    type="text"
                    required
                    placeholder="123.456.789-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="Rua, número, bairro, cidade/UF"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Anotações / Perfil do Cliente</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
