import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Lock, Car, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storeSync } from '../services/storeSync';
import { expenseCategories, summarizeVehicleFinancial, validateExpense } from '../utils/financial';

const money = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const blankExpense = () => {
  const date = new Date();
  return { category: 'compra', description: '', amount: '', expense_date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` };
};
const inputClass = 'mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-400';

export function FinancialView({ storeKey = 'autoelite', vehicles = [] }) {
  const { hasRole } = useAuth();
  if (!hasRole(['proprietario'])) return <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-lg mx-auto my-12 space-y-3">
    <Lock className="w-10 h-10 text-rose-400 mx-auto" />
    <h2 className="text-lg font-bold text-white">Acesso restrito ao proprietário</h2>
    <p className="text-sm text-slate-300">Custos de aquisição e resultados financeiros são acessíveis apenas pelo proprietário da loja.</p>
  </div>;
  return <FinancialWorkspace key={storeKey} storeKey={storeKey} vehicles={vehicles} />;
}

function FinancialWorkspace({ storeKey, vehicles }) {
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankExpense);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const currentVehicle = vehicles.find(vehicle => String(vehicle.id) === selectedId) || vehicles[0] || null;
  const summary = summarizeVehicleFinancial(currentVehicle, records);

  useEffect(() => {
    try { setRecords(storeSync.getRecords(storeKey, 'expenses')); }
    catch { setError('Não foi possível carregar os gastos salvos. Os dados existentes foram preservados.'); }
    return storeSync.subscribe(storeKey, detail => {
      if (detail.type === 'EXPENSES_UPDATED') setRecords(detail.expenses);
    });
  }, [storeKey]);

  useEffect(() => {
    setShowForm(false); setEditingId(null); setForm(blankExpense()); setFeedback('');
  }, [currentVehicle?.id]);

  const saveExpense = event => {
    event.preventDefault();
    try {
      const expense = validateExpense(form, currentVehicle?.id);
      const original = editingId === null ? {} : records.find(record => record.id === editingId);
      if (!original) throw new Error('Este lançamento foi removido em outra aba. Cancele a edição e atualize a lista.');
      setRecords(storeSync.saveRecord(storeKey, 'expenses', { ...original, ...expense }));
      setError(''); setFeedback(editingId === null ? 'Gasto registrado.' : 'Gasto atualizado.');
      setShowForm(false); setEditingId(null); setForm(blankExpense());
    } catch (failure) { setError(failure.message || 'Não foi possível salvar o gasto. Verifique o armazenamento do navegador.'); }
  };

  const removeExpense = expense => {
    if (!window.confirm(`Remover o lançamento “${expense.description}”?`)) return;
    try {
      setRecords(storeSync.deleteRecord(storeKey, 'expenses', expense.id));
      if (expense.id === editingId) { setShowForm(false); setEditingId(null); }
      setError(''); setFeedback('Gasto removido.');
    } catch (failure) { setError(failure.message || 'Não foi possível remover o lançamento.'); }
  };

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><DollarSign className="w-6 h-6 text-emerald-400" />Financeiro por veículo</h1>
        <p className="mt-2 text-sm text-slate-400">Registre a aquisição e os gastos da loja. Os lançamentos ficam salvos neste navegador, separados por loja.</p>
      </div>
      <button type="button" disabled={!currentVehicle} onClick={() => { setEditingId(null); setForm(blankExpense()); setShowForm(true); setError(''); setFeedback(''); }} className="shrink-0 self-start min-h-11 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" />Lançar gasto</button>
    </div>
    {error && <p role="alert" className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm text-rose-200">{error}</p>}
    {feedback && <p role="status" className="text-sm text-emerald-300">{feedback}</p>}
    {!currentVehicle ? <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 text-slate-300">Cadastre um veículo no estoque para começar a registrar custos.</div> : <>
      <label className="block p-4 rounded-2xl border border-slate-800 bg-slate-900 text-sm text-slate-300">
        <span className="flex items-center gap-2 font-semibold"><Car className="w-4 h-4" />Veículo</span>
        <select value={String(currentVehicle.id)} onChange={event => setSelectedId(event.target.value)} className={inputClass}>
          {vehicles.map(vehicle => <option key={vehicle.id} value={String(vehicle.id)}>{vehicle.title || vehicle.nome} — {vehicle.status === 'vendido' ? 'Vendido' : 'Em estoque'}</option>)}
        </select>
      </label>

      {showForm && <section className="p-5 rounded-2xl border border-emerald-600/40 bg-slate-900">
        <h2 className="text-lg font-semibold text-white mb-4">{editingId === null ? 'Novo lançamento' : 'Editar lançamento'}</h2>
        <form onSubmit={saveExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm text-slate-300">Categoria<select required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className={inputClass}>{Object.entries(expenseCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="text-sm text-slate-300">Data<input required type="date" value={form.expense_date} onChange={event => setForm({ ...form, expense_date: event.target.value })} className={inputClass} /></label>
          <label className="sm:col-span-2 text-sm text-slate-300">Descrição<input required maxLength={300} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className={inputClass} placeholder="Ex.: aquisição do veículo ou revisão de entrega" /></label>
          <label className="text-sm text-slate-300">Valor (R$)<input required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} className={inputClass} /></label>
          <div className="flex justify-end items-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 min-h-11 rounded-xl border border-slate-600 text-slate-200">Cancelar</button>
            <button type="submit" className="px-4 min-h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Salvar lançamento</button>
          </div>
        </form>
      </section>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric label={summary.hasConfirmedSale ? 'Valor efetivo da venda' : 'Preço anunciado'} value={money(summary.salePrice)} detail={summary.hasConfirmedSale ? 'Venda confirmada no cadastro' : 'Valor cadastrado no estoque'} />
        <Metric label="Custos registrados" value={money(summary.totalCost)} detail={`Aquisição: ${money(summary.acquisition)} · Outros: ${money(summary.operatingCosts)}`} />
        <Metric label={summary.hasConfirmedSale ? 'Resultado realizado' : 'Resultado estimado'} value={summary.profit === null ? 'Aguardando dados' : money(summary.profit)} detail={summary.marginPct === null ? 'Registre a aquisição e o valor de venda para calcular.' : `Margem de ${summary.marginPct.toLocaleString('pt-BR')}% sobre a venda; considera apenas custos registrados.`} />
      </div>
      {!summary.hasPurchase && <p className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200">O custo de aquisição ainda não foi registrado. O resultado não será calculado até que haja um lançamento de compra.</p>}
      {currentVehicle.status === 'vendido' && !summary.hasConfirmedSale && <p className="text-sm text-amber-200">Este veículo está vendido, mas não possui valor efetivo de venda confirmado. O resultado mostrado continua sendo uma estimativa pelo preço anunciado.</p>}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3"><h2 className="font-semibold text-white">Lançamentos do veículo</h2><span className="text-sm text-slate-400">{summary.expenses.length} registro(s)</span></div>
        {!summary.expenses.length && <p className="p-5 text-sm text-slate-400">Nenhum gasto registrado para este veículo.</p>}
        <ul className="divide-y divide-slate-800">{summary.expenses.map(expense => <li key={expense.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0"><p className="font-medium text-white break-words">{expense.description}</p><p className="text-sm text-slate-400 mt-1">{expenseCategories[expense.category] || expense.category} · {displayDate(expense.expense_date || expense.date)}</p></div>
          <div className="flex items-center gap-3 shrink-0"><span className="text-rose-300 font-semibold">{money(expense.amount)}</span><button type="button" aria-label={`Editar ${expense.description}`} onClick={() => { setEditingId(expense.id); setForm({ category: expense.category, description: expense.description, amount: expense.amount, expense_date: expense.expense_date || '' }); setShowForm(true); setError(''); setFeedback(''); }} className="p-2.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800"><Pencil className="w-4 h-4" /></button><button type="button" aria-label={`Remover ${expense.description}`} onClick={() => removeExpense(expense)} className="p-2.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"><Trash2 className="w-4 h-4" /></button></div>
        </li>)}</ul>
      </section>
    </>}
  </div>;
}

function Metric({ label, value, detail }) {
  return <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900"><h2 className="text-sm text-slate-400">{label}</h2><p className="mt-2 text-2xl font-bold text-white">{value}</p><p className="mt-2 text-xs text-slate-400 leading-relaxed">{detail}</p></div>;
}

function displayDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value.split('-').reverse().join('/');
  return value || 'Sem data';
}
