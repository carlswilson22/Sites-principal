/**
 * packages/merchant-core/src/pages/LeadsView.jsx
 * Gestão de Contatos, Leads e WhatsApp (E6 - Nível 1)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { storeSync } from '../services/storeSync';
import { useTier } from '../context/TierContext';
import {
  MessageSquare,
  Search,
  PhoneCall,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  Car
} from 'lucide-react';

export function LeadsView({ storeKey = 'autoelite' }) {
  const { tier } = useTier();
  const [feedback, setFeedback] = useState('');
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // todos, novo, em_atendimento, ganho, perdido
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('em_atendimento');
  const [statusNote, setStatusNote] = useState('');

  const handleCreateClient = lead => {
    try {
      const phone = value => String(value || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
      const clients = storeSync.getRecords(storeKey, 'clients');
      if (clients.some(client => client.sourceLeadId === lead.id || (phone(lead.phone) && phone(client.phone) === phone(lead.phone)))) {
        setFeedback('Este contato já está cadastrado na carteira de clientes.');
        return;
      }
      storeSync.saveRecord(storeKey, 'clients', {
        name: lead.name, phone: lead.phone, email: lead.email || '',
        cpfMasked: '', notes: lead.message || '', sourceLeadId: lead.id
      });
      setFeedback('Cliente cadastrado no CRM desta loja.');
    } catch {
      setFeedback('Não foi possível cadastrar o cliente. Verifique o armazenamento do navegador.');
    }
  };

  // Carga reativa de leads via storeSync
  useEffect(() => {
    const list = storeSync.getLeads(storeKey);
    setLeads(list);

    const unsub = storeSync.subscribe(storeKey, (detail) => {
      if (detail.type === 'LEADS_UPDATED') {
        setLeads(detail.leads);
      }
    });
    return unsub;
  }, [storeKey]);

  // Filtragem
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch =
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm) ||
        (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.vehicle_title && l.vehicle_title.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter !== 'todos' && l.status !== statusFilter) return false;

      return true;
    });
  }, [leads, searchTerm, statusFilter]);

  // Atualizar situação do lead com storeSync
  const handleUpdateStatus = () => {
    if (!selectedLead) return;
    const updated = storeSync.updateLead(storeKey, selectedLead.id, {
      status: newStatus,
      statusNote: statusNote || undefined
    });
    setLeads(updated);
    setSelectedLead(null);
    setStatusNote('');
  };

  const getStatusBadge = (status) => {
    const map = {
      novo: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Novo Lead', icon: AlertCircle },
      em_atendimento: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Em Atendimento', icon: Clock },
      ganho: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Venda Fechada (Ganho)', icon: CheckCircle2 },
      perdido: { bg: 'bg-slate-700/40 text-slate-400 border-slate-700', label: 'Negócio Perdido', icon: XCircle }
    };
    const s = map[status] || map.novo;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg}`}>
        <Icon className="w-3.5 h-3.5" />
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {feedback && <p role="status" className="text-sm text-amber-300">{feedback}</p>}
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Contatos & Leads do Site (E6)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centralize mensagens do formulário e cliques no botão de WhatsApp da sua loja.
          </p>
        </div>
      </div>

      {/* 2. Busca e Filtro de Situação */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, telefone ou veículo de interesse..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Chips de Situação */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'novo', label: 'Novos' },
            { id: 'em_atendimento', label: 'Em Atendimento' },
            { id: 'ganho', label: 'Ganhos' },
            { id: 'perdido', label: 'Perdidos' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista de Contatos */}
      <div className="space-y-3">
        {filteredLeads.map(lead => {
          const rawPhone = lead.phone.replace(/\D/g, '');
          const phoneWithCountry = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone;
          const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=Ol%C3%A1%20${encodeURIComponent(lead.name)},%20sou%20da%20concession%C3%A1ria%20e%20vi%20seu%20interesse%20no%20${encodeURIComponent(lead.vehicle_title || lead.vehicleName || 'veículo')}!%20Como%20posso%20te%20ajudar?`;

          return (
            <div
              key={lead.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                  {lead.name.charAt(0)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">{lead.name}</span>
                    {getStatusBadge(lead.status)}
                    <span className="text-[11px] text-slate-500">• {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>{lead.phone}</span>
                    {lead.email && <span>• {lead.email}</span>}
                    <span>• Origem: <strong className="text-slate-300 capitalize">{lead.source.replace('_', ' ')}</strong></span>
                  </div>

                  {lead.vehicle_title && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1.5 font-medium">
                      <Car className="w-3.5 h-3.5" />
                      Interesse em: <strong>{lead.vehicle_title}</strong>
                      {lead.vehicle_price != null && <span>(R$ {lead.vehicle_price.toLocaleString('pt-BR')})</span>}
                    </div>
                  )}

                  {lead.message && <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">{lead.message}</p>}
                  {lead.simulation_data && (
                    <div className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mt-1.5">
                      Simulação: Entrada R$ {lead.simulation_data.entrada?.toLocaleString('pt-BR')} + {lead.simulation_data.parcelas}x de R$ {lead.simulation_data.valorParcela?.toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Rápidas (E6) */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {tier >= 2 && <button type="button" onClick={() => handleCreateClient(lead)} className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-semibold">Cadastrar cliente</button>}
                {/* Botão de Abertura do WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  Abrir WhatsApp
                </a>

                {/* Alterar Situação */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLead(lead);
                    setNewStatus(lead.status);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Mudar Situação
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Atualização de Situação */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">
              Atualizar Situação do Lead
            </h3>
            <p className="text-xs text-slate-400">
              Contato: <strong>{selectedLead.name}</strong> ({selectedLead.phone})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nova Situação</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="novo">Novo Lead (Aguardando contato)</option>
                <option value="em_atendimento">Em Atendimento (Negociando)</option>
                <option value="ganho">Ganho (Venda concretizada!)</option>
                <option value="perdido">Perdido (Sem interesse / desistiu)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

