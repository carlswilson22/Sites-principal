/**
 * packages/merchant-core/src/pages/LeadsView.jsx
 * Gestão de Contatos, Leads e WhatsApp (E6 - Nível 1)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { storeSync } from '../services/storeSync';
import { buildLeadStatusUpdates, leadStatusLabels } from '../utils/leadHistory';
import { leadBooking, leadUnanswered } from '../utils/leadAgenda';
import { MerchantModalTransition } from '../components/common/MerchantModalTransition';
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

export function LeadActionForm({ lead, storeKey, onSaved }) {
  const [action, setAction] = useState(lead.next_action || '');
  const [when, setWhen] = useState(() => {
    const date = new Date(lead.next_action_at || '');
    if (!Number.isFinite(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [feedback, setFeedback] = useState('');
  const save = async (clear = false) => {
    if (!clear && (!action.trim() || !when || !Number.isFinite(Date.parse(when)))) return setFeedback('Informe a ação e a data.');
    try {
      const updated = await storeSync.updateLead(storeKey, lead.id, { next_action: clear ? '' : action.trim(), next_action_at: clear ? null : new Date(when).toISOString() });
      onSaved(updated); setFeedback(clear ? 'Ação removida.' : 'Próxima ação salva.');
    } catch (error) { setFeedback(error.message || 'Não foi possível salvar.'); }
  };
  return <details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold text-blue-600">{lead.next_action ? `Próxima ação: ${lead.next_action}` : 'Definir próxima ação'}</summary>
    <div className="mt-2 grid gap-2 sm:grid-cols-2"><label className="text-slate-600">Ação<input value={action} onChange={event => setAction(event.target.value)} maxLength={200} placeholder="Ex.: ligar para o cliente" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900" /></label><label className="text-slate-600">Data e hora<input type="datetime-local" value={when} onChange={event => setWhen(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900" /></label></div>
    <div className="mt-2 flex gap-2"><button type="button" onClick={() => save()} className="rounded-lg bg-blue-600 px-3 py-2 text-white">Salvar ação</button>{lead.next_action && <button type="button" onClick={() => save(true)} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">Remover</button>}</div>{feedback && <p role="status" className="mt-1 text-slate-700">{feedback}</p>}
  </details>;
}

export function LeadsView({ storeKey = 'autoelite', onOpenContractWithClient }) {
  const [feedback, setFeedback] = useState('');
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // todos, novo, em_atendimento, ganho, perdido
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [newStatus, setNewStatus] = useState('em_atendimento');
  const [statusNote, setStatusNote] = useState('');
  const [statusError, setStatusError] = useState('');
  const [now, setNow] = useState(Date.now);
  const alertAfter = storeSync.getSettings?.()?.leadAlertMinutes || 60;
  const selectedLead = leads.find(lead => lead.id === selectedLeadId) || null;

  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);

  // Carga reativa de leads via storeSync
  useEffect(() => {
    setSelectedLeadId(null);
    setStatusNote('');
    setStatusError('');
    setFeedback('');
    const list = storeSync.getLeads(storeKey);
    setLeads(list);

    const unsub = storeSync.subscribe(storeKey, (detail) => {
      if (detail.type === 'LEADS_UPDATED') {
        setLeads(detail.leads);
      }
    });
    return unsub;
  }, [storeKey]);

  useEffect(() => {
    if (selectedLeadId !== null && !selectedLead) {
      setSelectedLeadId(null);
      setStatusNote('');
      setStatusError('');
      setFeedback('Este contato não está mais disponível na lista atual.');
    }
  }, [selectedLeadId, selectedLead]);

  useEffect(() => {
    if (selectedLead) setNewStatus(selectedLead.status || 'novo');
  }, [selectedLeadId, selectedLead?.status]);

  // Filtragem
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch =
        String(l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(l.phone || '').includes(searchTerm) ||
        String(l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(l.vehicle_title || l.vehicleName || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'todos' && l.status !== statusFilter) return false;

      return true;
    });
  }, [leads, searchTerm, statusFilter]);

  // Atualizar situação do lead com storeSync
  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    try {
      const latestLead = storeSync.getLeads(storeKey).find(lead => lead.id === selectedLeadId);
      if (!latestLead) throw new Error('Este contato não está mais disponível. Atualize a lista para continuar.');
      const updates = buildLeadStatusUpdates(latestLead, newStatus, statusNote);
      const updated = await storeSync.updateLead(storeKey, selectedLead.id, updates);
      setLeads(updated);
      setSelectedLeadId(null);
      setStatusNote('');
      setStatusError('');
      setFeedback('Atendimento registrado no histórico do contato.');
    } catch (error) {
      setStatusError(error.message || 'Não foi possível salvar o atendimento. Tente novamente.');
    }
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
            Contatos e oportunidades
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe as mensagens e os interesses enviados para a loja.
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

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><strong>Origem de marketing</strong><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">{Object.entries(leads.reduce((groups, lead) => { const key = lead.marketing_source || 'Não informada'; const item = groups[key] || { total: 0, sales: 0 }; item.total++; if (lead.status === 'ganho') item.sales++; groups[key] = item; return groups; }, {})).map(([source, counts]) => <span key={source}>{source}: {counts.total} contato(s), {counts.sales} ganho(s)</span>)}</div></div>
      <p role="status" className="text-sm text-slate-400">{filteredLeads.length} de {leads.length} contatos</p>
      {filteredLeads.length === 0 && <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400">
        {leads.length ? 'Nenhum contato corresponde à busca e à situação selecionadas.' : 'Nenhum contato recebido nesta loja. Novas solicitações aparecerão aqui.'}
      </div>}

      {/* 3. Lista de Contatos */}
      <div className="space-y-3">
        {filteredLeads.map(lead => {
          const history = Array.isArray(lead.history) ? lead.history.filter(entry => entry && typeof entry === 'object') : [];
          let simulation = lead.simulation || lead.simulation_data;
          if (typeof simulation === 'string') { try { simulation = JSON.parse(simulation); } catch { simulation = null; } }
          const booking = leadBooking(lead);
          if (booking) simulation = null;
          const unanswered = leadUnanswered(lead, now, alertAfter);
          const simulationMoney = value => value == null ? 'não informado' : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const rawPhone = String(lead.phone || '').replace(/\D/g, '');
          const phoneWithCountry = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone;
          const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=Ol%C3%A1%20${encodeURIComponent(lead.name)},%20sou%20da%20concession%C3%A1ria%20e%20vi%20seu%20interesse%20no%20${encodeURIComponent(lead.vehicle_title || lead.vehicleName || 'veículo')}!%20Como%20posso%20te%20ajudar?`;

          return (
            <div
              key={lead.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${unanswered ? 'border-red-400 bg-red-50' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                  {String(lead.name || '?').charAt(0)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">{lead.name}</span>
                    {getStatusBadge(lead.status)}
                    {unanswered && <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-800">Sem resposta há {alertAfter} min</span>}
                    <span className="text-[11px] text-slate-500">• {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>{lead.phone}</span>
                    {lead.email && <span>• {lead.email}</span>}
                    <span>• Origem: <strong className="text-slate-300 capitalize">{String(lead.source || 'site').replaceAll('_', ' ')}</strong></span>
                    <span>• Canal: {lead.marketing_source || 'Não informado'}{lead.marketing_campaign ? ` · Campanha: ${lead.marketing_campaign}` : ''}</span>
                  </div>

                  {lead.vehicle_title && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1.5 font-medium">
                      <Car className="w-3.5 h-3.5" />
                      Interesse em: <strong>{lead.vehicle_title}</strong>
                      {lead.vehicle_price != null && <span>(R$ {lead.vehicle_price.toLocaleString('pt-BR')})</span>}
                    </div>
                  )}

                  {lead.message && <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">{lead.message}</p>}
                  <LeadActionForm key={`${lead.id}-${lead.next_action_at || ''}`} lead={lead} storeKey={storeKey} onSaved={setLeads} />
                  {history.length > 0 && <details className="mt-3 text-xs text-slate-300">
                    <summary className="cursor-pointer text-blue-300">Histórico de atendimento ({history.length})</summary>
                    <ol className="mt-2 space-y-2 border-l border-slate-700 pl-3">
                      {[...history].reverse().map((entry, index) => <li key={`${entry.date}-${index}`} className="space-y-1">
                        <p className="text-slate-400">{Number.isNaN(Date.parse(entry.date)) ? 'Data não informada' : new Date(entry.date).toLocaleString('pt-BR')}</p>
                        <p>{leadStatusLabels[entry.previous] || String(entry.previous || 'Novo contato')} → {leadStatusLabels[entry.status] || String(entry.status || 'Atualizado')}</p>
                        {entry.note && <p className="whitespace-pre-wrap">{String(entry.note)}</p>}
                      </li>)}
                    </ol>
                  </details>}
                  {simulation && (
                    <div className="text-xs text-amber-200 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 inline-block mt-2 space-y-1">
                      <p className="font-semibold">Simulação de financiamento</p>
                      <p>Entrada {simulationMoney(simulation.entrada)} · {simulation.parcelas ?? 'Prazo não informado'}x de {simulationMoney(simulation.valorParcela)}</p>
                      {simulation.banco && <p>Condição: {simulation.banco} · Taxa ilustrativa: {simulation.taxaMensal}% ao mês</p>}
                      {simulation.valorVeiculo != null && <p>Valor do veículo: {Number(simulation.valorVeiculo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Rápidas (E6) */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {onOpenContractWithClient && <button type="button" onClick={() => onOpenContractWithClient({ name: lead.name, phone: lead.phone })} className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-semibold">Criar contrato</button>}
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
                    setSelectedLeadId(lead.id);
                    setNewStatus(lead.status || 'novo');
                    setStatusNote('');
                    setStatusError('');
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
      <MerchantModalTransition open={Boolean(selectedLead)}>{selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div role="dialog" aria-modal="true" aria-labelledby="lead-status-title" className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
            <h3 id="lead-status-title" className="font-bold text-white text-base">
              Atualizar Situação do Lead
            </h3>
            <p className="text-xs text-slate-400">
              Contato: <strong>{selectedLead.name}</strong> ({selectedLead.phone})
            </p>
            {statusError && <p role="alert" className="text-sm text-rose-300">{statusError}</p>}

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

            <label className="block text-xs font-semibold text-slate-300">
              Observação do atendimento
              <textarea rows={3} maxLength={1000} value={statusNote} onChange={event => setStatusNote(event.target.value)} placeholder="Registre o retorno do cliente ou o próximo passo." className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 focus:outline-none" />
              <span className="mt-1 block text-slate-500 font-normal">A observação será adicionada ao histórico deste contato.</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
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
      )}</MerchantModalTransition>
    </div>
  );
}

