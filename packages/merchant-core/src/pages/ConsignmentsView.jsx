/**
 * packages/merchant-core/src/pages/ConsignmentsView.jsx
 * Gestão de Consignação Completa (Nível 3 - A1).
 * Suporta remuneração percentual (com mínimo) ou valor líquido, diárias de guarda e prazos de repasse.
 */
import React, { useState, useEffect } from 'react';
import { FileText, Plus, AlertTriangle, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { isDemoMode } from '../services/demoConfig';
import { useDialog } from '../components/common/useDialog';

function ConsignmentDialog({ onClose, children }) {
  const ref = useDialog(onClose);
  return <div ref={ref} role="dialog" aria-modal="true" aria-label="Nova consignação" tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"><div className="bg-slate-900 border border-slate-700 rounded-2xl w-full min-w-0 max-w-2xl max-h-[92dvh] overflow-y-auto shadow-2xl p-4 sm:p-6">{children}</div></div>;
}

export function ConsignmentsView({ storeKey = 'apexluxury', vehicles = [] }) {
  const [consignments, setConsignments] = useState([]);
  const [alerts, setAlerts] = useState({ uncontractedVehicles: [], expiringConsignments: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

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
  }, [storeKey, vehicles]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [list, alertData] = await Promise.all([
        apiClient.getConsignments(storeKey, vehicles),
        apiClient.getConsignmentAlerts(storeKey, vehicles)
      ]);
      setConsignments(list || []);
      setAlerts(alertData || { uncontractedVehicles: [], expiringConsignments: [] });
    } catch (failure) { setError(failure.message); } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      await apiClient.saveConsignment(form, storeKey, vehicles);
      setIsModalOpen(false);
      setFeedback('Consignação registrada. Os valores e prazos já estão na tabela.');
      await loadData();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };

  const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-w-0 w-full space-y-6 leading-relaxed">
      {error && !isModalOpen && <p role="alert" className="p-4 rounded-xl bg-rose-950 text-rose-200">{error}</p>}
      {feedback && <p role="status" className="p-4 rounded-xl bg-emerald-950 text-emerald-200">{feedback}</p>}
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Consignação Completa</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de veículos de terceiros, controle de diárias, contratos de guarda e repasse aos consignantes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl text-sm whitespace-nowrap transition-colors shadow-lg shadow-emerald-500/20"
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
        <div role="region" aria-label="Consignações registradas" tabIndex={0} className="max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300">
          <table className="min-w-[1120px] w-full table-fixed text-left text-sm leading-5 text-slate-300">
            <colgroup><col className="w-[210px]" /><col className="w-[180px]" /><col className="w-[190px]" /><col className="w-[130px]" /><col className="w-[130px]" /><col className="w-[150px]" /><col className="w-[150px]" /></colgroup>
            <thead className="bg-slate-800/60 text-sm font-semibold text-slate-300 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Veículo</th>
                <th scope="col" className="px-4 py-4">Consignante</th>
                <th scope="col" className="px-5 py-3.5">Modalidade</th>
                <th scope="col" className="px-4 py-4">Diárias acumuladas</th>
                <th scope="col" className="px-4 py-4">Comissão da loja</th>
                <th scope="col" className="px-4 py-4">Repasse líquido</th>
                <th scope="col" className="px-5 py-3.5">Vigência</th>
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
                      <div className="font-semibold break-words text-slate-200">{c.vehicle_title}</div>
                      <div className="text-sm tabular-nums text-slate-300 mt-1">{formatBrl(c.vehicle_price)}</div><div className="text-xs text-slate-400 mt-1">{c.days_in_stock} dias em estoque</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-200 font-medium break-words">{c.owner_name}</div>
                      <div className="text-xs tabular-nums text-slate-400 mt-1">CPF: {c.owner_cpf_masked}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1"><span className="block font-medium text-slate-200">{c.remuneration_type === 'percentual' ? `${c.remuneration_value}% sobre a venda` : 'Valor líquido fixo'}</span><span className="block text-xs text-slate-400 tabular-nums">{c.remuneration_type === 'percentual' ? `Mínimo de ${formatBrl(c.min_remuneration)}` : formatBrl(c.remuneration_value)}</span></div>
                    </td>
                    <td className="px-4 py-4 tabular-nums text-sm whitespace-nowrap">
                      <div>{formatBrl(c.settlement?.totalStorageFee)}</div>
                      <div className="text-xs text-slate-400 mt-1">{formatBrl(c.daily_storage_fee)}/dia</div>
                    </td>
                    <td className="px-4 py-4 tabular-nums text-emerald-400 font-semibold whitespace-nowrap">
                      {formatBrl(c.settlement?.storeCommission)}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-slate-200 font-semibold whitespace-nowrap">
                      {formatBrl(c.settlement?.ownerNetPayout)}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="text-slate-300 tabular-nums">Até {new Date(`${String(c.contract_end).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}</div>
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
        <ConsignmentDialog onClose={() => setIsModalOpen(false)}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Nova consignação
              </h3>
              <button
                type="button"
                aria-label="Fechar nova consignação"
                onClick={() => setIsModalOpen(false)}
                className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                {error && <p role="alert" className="p-3 rounded-xl bg-rose-950 text-rose-200 text-sm">{error}</p>}
                {isDemoMode && <button type="button" onClick={() => setForm({ ...form, vehicle_id: String(vehicles[0]?.id || ''), owner_name: 'Fernando Prado — exemplo', owner_cpf: '000.000.000-00', owner_bank_data: 'Banco de exemplo · Agência 0000 · Conta 00000-0' })} className="min-h-11 text-sm text-emerald-200 underline underline-offset-4">Preencher dados de exemplo</button>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Veículo em estoque</label>
                  <select
                    aria-label="Veículo em consignação"
                    required
                    value={form.vehicle_id}
                    onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  ><option value="">Selecione um veículo</option>{vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.title || vehicle.nome} · {vehicle.year || vehicle.ano}</option>)}</select>
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Nome do consignante</label>
                  <input
                    type="text"
                    required
                    value={form.owner_name}
                    onChange={e => setForm({ ...form, owner_name: e.target.value })}
                    placeholder="Nome completo fictício"
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">CPF do Consignante</label>
                  <input
                    type="text"
                    required
                    value={form.owner_cpf}
                    onChange={e => setForm({ ...form, owner_cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Dados bancários para repasse</label>
                  <input
                    type="text"
                    value={form.owner_bank_data}
                    onChange={e => setForm({ ...form, owner_bank_data: e.target.value })}
                    placeholder="Banco, Agência, Conta, Chave PIX"
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Remuneração</label>
                  <select
                    value={form.remuneration_type}
                    onChange={e => setForm({ ...form, remuneration_type: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="valor_liquido">Valor Líquido Fixo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">
                    {form.remuneration_type === 'percentual' ? 'Taxa (%)' : 'Valor Líquido (R$)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.remuneration_value}
                    onChange={e => setForm({ ...form, remuneration_value: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Comissão mínima (R$)</label>
                  <input
                    type="number"
                    value={form.min_remuneration}
                    onChange={e => setForm({ ...form, min_remuneration: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Taxa de preparação (R$)</label>
                  <input
                    type="number"
                    value={form.service_fee}
                    onChange={e => setForm({ ...form, service_fee: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Diária de guarda (R$)</label>
                  <input
                    type="number"
                    value={form.daily_storage_fee}
                    onChange={e => setForm({ ...form, daily_storage_fee: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Prazo de repasse (dias)</label>
                  <input
                    type="number"
                    value={form.payout_deadline_days}
                    onChange={e => setForm({ ...form, payout_deadline_days: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Início da Vigência</label>
                  <input
                    type="date"
                    required
                    value={form.contract_start}
                    onChange={e => setForm({ ...form, contract_start: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm leading-5 font-medium text-slate-300 mb-2">Término da Vigência</label>
                  <input
                    type="date"
                    required
                    value={form.contract_end}
                    onChange={e => setForm({ ...form, contract_end: e.target.value })}
                    className="w-full min-w-0 min-h-12 leading-6 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold rounded-xl transition-colors"
                >
                  {saving ? 'Registrando…' : 'Registrar Consignação'}
                </button>
              </div>
            </form>
        </ConsignmentDialog>
      )}
    </div>
  );
}

