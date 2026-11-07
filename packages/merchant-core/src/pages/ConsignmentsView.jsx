/**
 * packages/merchant-core/src/pages/ConsignmentsView.jsx
 * Gestão de Consignação Completa (Nível 3 - A1).
 * Suporta remuneração percentual (com mínimo) ou valor líquido, diárias de guarda e prazos de repasse.
 */
import React, { useState, useEffect } from 'react';
import { FileText, Plus, AlertTriangle, Clock, CheckCircle2, DollarSign, Calendar, ShieldCheck, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function ConsignmentsView() {
  const [consignments, setConsignments] = useState([]);
  const [alerts, setAlerts] = useState({ uncontractedVehicles: [], expiringConsignments: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    vehicle_id: '',
    owner_name: '',
    owner_cpf: '',
    owner_bank_data: '',
    remuneration_type: 'percentual',
    remuneration_value: 6.0,
    min_remuneration: 3500,
    service_fee: 350,
    daily_storage_fee: 15,
    contract_start: new Date().toISOString().split('T')[0],
    contract_end: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    payout_deadline_days: 5,
    advanced_expenses: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, alertData] = await Promise.all([
        apiClient.getConsignments(),
        apiClient.getConsignmentAlerts()
      ]);
      setConsignments(list || []);
      setAlerts(alertData || { uncontractedVehicles: [], expiringConsignments: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await apiClient.saveConsignment(form);
    setIsModalOpen(false);
    loadData();
  };

  const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Consignação Completa</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tier 3 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de veículos de terceiros, controle de diárias, contratos de guarda e repasse aos consignantes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Nova Consignação
        </button>
      </div>

      {/* Banner de Alertas (A1: Aviso de consignados sem contrato ou vencendo) */}
      {(alerts.uncontractedVehicles?.length > 0 || alerts.expiringConsignments?.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            Alertas Operacionais de Consignação
          </div>
          {alerts.uncontractedVehicles?.map(v => (
            <div key={v.id} className="text-xs text-amber-200/90 pl-7">
              • Veículo em pátio marcado como consignado <strong>sem contrato formal registrado</strong>: {v.title} ({formatBrl(v.price)}).
            </div>
          ))}
          {alerts.expiringConsignments?.map(c => (
            <div key={c.id} className="text-xs text-amber-200/90 pl-7">
              • Contrato de consignação com prazo expirado ou prestes a vencer: {c.vehicle_title} (Dono: {c.owner_name}).
            </div>
          ))}
        </div>
      )}

      {/* Tabela de Consignações */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Veículo</th>
                <th className="px-5 py-3.5">Consignante (Dono)</th>
                <th className="px-5 py-3.5">Modalidade</th>
                <th className="px-5 py-3.5">Diárias Acumuladas</th>
                <th className="px-5 py-3.5">Comissão Loja</th>
                <th className="px-5 py-3.5">Líquido ao Dono</th>
                <th className="px-5 py-3.5">Vigência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    Carregando contratos de consignação...
                  </td>
                </tr>
              ) : consignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    Nenhum veículo em consignação registrado no momento.
                  </td>
                </tr>
              ) : (
                consignments.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{c.vehicle_title}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{formatBrl(c.vehicle_price)} • {c.days_in_stock} dias em estoque</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-200 font-medium">{c.owner_name}</div>
                      <div className="text-xs text-slate-400 font-mono">CPF: {c.owner_cpf_masked}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                        {c.remuneration_type === 'percentual' ? `${c.remuneration_value}% (Piso ${formatBrl(c.min_remuneration)})` : `Líquido: ${formatBrl(c.remuneration_value)}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      <div>{formatBrl(c.settlement?.totalStorageFee)}</div>
                      <div className="text-slate-500">({formatBrl(c.daily_storage_fee)}/dia)</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-emerald-400 font-semibold">
                      {formatBrl(c.settlement?.storeCommission)}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-200 font-semibold">
                      {formatBrl(c.settlement?.ownerNetPayout)}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="text-slate-300">Até {new Date(c.contract_end).toLocaleDateString('pt-BR')}</div>
                      {c.expiry?.isExpired ? (
                        <span className="text-red-400 font-semibold">Vencido</span>
                      ) : (
                        <span className="text-slate-400">{c.expiry?.daysRemaining} dias restantes</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Consignação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Cadastrar Contrato de Consignação
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ID do Veículo em Estoque</label>
                  <input
                    type="number"
                    required
                    value={form.vehicle_id}
                    onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
                    placeholder="Ex: 3"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Consignante (Dono)</label>
                  <input
                    type="text"
                    required
                    value={form.owner_name}
                    onChange={e => setForm({ ...form, owner_name: e.target.value })}
                    placeholder="Nome completo fictício"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CPF do Consignante</label>
                  <input
                    type="text"
                    required
                    value={form.owner_cpf}
                    onChange={e => setForm({ ...form, owner_cpf: e.target.value })}
                    placeholder="000.000.000-00 (criptografado em repouso)"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dados Bancários para Repasse</label>
                  <input
                    type="text"
                    value={form.owner_bank_data}
                    onChange={e => setForm({ ...form, owner_bank_data: e.target.value })}
                    placeholder="Banco, Agência, Conta, Chave PIX"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Remuneração</label>
                  <select
                    value={form.remuneration_type}
                    onChange={e => setForm({ ...form, remuneration_type: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="valor_liquido">Valor Líquido Fixo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {form.remuneration_type === 'percentual' ? 'Taxa (%)' : 'Valor Líquido (R$)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.remuneration_value}
                    onChange={e => setForm({ ...form, remuneration_value: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor Piso Mínimo (R$)</label>
                  <input
                    type="number"
                    value={form.min_remuneration}
                    onChange={e => setForm({ ...form, min_remuneration: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Taxa de Entrada / Estética (R$)</label>
                  <input
                    type="number"
                    value={form.service_fee}
                    onChange={e => setForm({ ...form, service_fee: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Diária de Guarda / Estacionamento (R$)</label>
                  <input
                    type="number"
                    value={form.daily_storage_fee}
                    onChange={e => setForm({ ...form, daily_storage_fee: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Prazo de Repasse (Dias)</label>
                  <input
                    type="number"
                    value={form.payout_deadline_days}
                    onChange={e => setForm({ ...form, payout_deadline_days: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Início da Vigência</label>
                  <input
                    type="date"
                    required
                    value={form.contract_start}
                    onChange={e => setForm({ ...form, contract_start: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Término da Vigência</label>
                  <input
                    type="date"
                    required
                    value={form.contract_end}
                    onChange={e => setForm({ ...form, contract_end: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold rounded-xl transition-colors"
                >
                  Registrar Consignação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

