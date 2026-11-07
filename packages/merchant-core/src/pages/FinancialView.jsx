/**
 * packages/merchant-core/src/pages/FinancialView.jsx
 * Controle Financeiro Básico, Despesas por Carro e Margens (I8 - Nível 2)
 * VISÍVEL APENAS PARA O PROPRIETÁRIO (Regra Estrita RBAC)
 */
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Lock, TrendingUp, AlertTriangle, ShieldCheck, Car, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function FinancialView() {
  const { user, hasRole } = useAuth();
  const [selectedVehicleId, setSelectedVehicleId] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'estetica',
    description: '',
    amount: 350,
    expense_date: new Date().toISOString().split('T')[0]
  });

  const vehicles = [
    { id: 1, title: 'Chevrolet Tracker 1.2 Premier', salePrice: 119900, purchasePrice: 98000, status: 'disponivel' },
    { id: 2, title: 'Toyota Corolla Cross 2.0 XRE', salePrice: 139900, purchasePrice: 118000, status: 'disponivel' },
    { id: 4, title: 'Volkswagen Polo 1.0 TSI', salePrice: 84900, purchasePrice: 68000, status: 'vendido' }
  ];

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    setExpenses([
      { id: 1, vehicle_id: 1, category: 'compra', categoryLabel: 'Aquisição', description: 'Compra direta na troca', amount: 98000, date: '10/10/2026' },
      { id: 2, vehicle_id: 1, category: 'estetica', categoryLabel: 'Estética', description: 'Higienização e polimento técnico', amount: 450, date: '12/10/2026' },
      { id: 3, vehicle_id: 1, category: 'documentacao', categoryLabel: 'Documentação', description: 'Laudo cautelar e taxa de transferência', amount: 380, date: '14/10/2026' }
    ]);
  }, [selectedVehicleId]);

  // Bloqueio de Segurança para Perfis Não Proprietários (I8)
  if (!hasRole(['proprietario'])) {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-lg mx-auto my-12 space-y-3">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Acesso Restrito ao Proprietário</h2>
        <p className="text-xs text-slate-300">
          O DRE financeiro, custos de aquisição e margens líquidas são informações confidenciais acessíveis exclusivamente pelo titular da concessionária.
        </p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const projectedProfit = currentVehicle.salePrice - totalExpenses;
  const marginPct = Math.round((projectedProfit / currentVehicle.salePrice) * 1000) / 10;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.amount) return;

    const added = {
      id: Date.now(),
      vehicle_id: selectedVehicleId,
      category: newExpense.category,
      categoryLabel: newExpense.category.toUpperCase(),
      description: newExpense.description || 'Despesa operacional',
      amount: parseFloat(newExpense.amount),
      date: newExpense.expense_date
    };

    setExpenses(prev => [added, ...prev]);
    setIsModalOpen(false);
  };

  const getCategoryColor = (cat) => {
    const map = {
      compra: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      documentacao: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      funilaria: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      mecanica: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      estetica: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      pecas: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      outros: 'bg-slate-700 text-slate-300 border-slate-600'
    };
    return map[cat] || map.outros;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Financeiro & Margens por Veículo (I8)
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              Proprietário
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Lançamento de gastos categorizados, custo total acumulado e margem de lucro por veículo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Lançar Despesa
        </button>
      </div>

      {/* 2. Seletor de Veículo para Análise Financeira */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <Car className="w-5 h-5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-300">Veículo Selecionado:</span>
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(parseInt(e.target.value, 10))}
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
        >
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>
              {v.title} — Venda: R$ {v.salePrice?.toLocaleString('pt-BR')} ({v.status})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Indicadores de Custo e Lucro do Carro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Preço de Venda do Anúncio</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            R$ {currentVehicle.salePrice?.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-slate-500">Valor cadastrado na vitrine</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Custo Total Acumulado</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">
            R$ {totalExpenses.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-slate-500">Aquisição + reformas e taxas</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg">
          <span className="text-xs text-emerald-400 font-semibold uppercase">
            {currentVehicle.status === 'vendido' ? 'Lucro Realizado' : 'Lucro Líquido Previsto'}
          </span>
          <div className="text-2xl font-extrabold text-emerald-300 mt-1">
            R$ {projectedProfit.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            Margem de {marginPct}% sobre a venda
          </span>
        </div>
      </div>

      {/* 4. Tabela de Despesas Lançadas */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Detalhamento de Custos e Reformas (I8)
          </h3>
          <span className="text-xs text-slate-400">Total: {expenses.length} lançamentos</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {expenses.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <div>
                  <span className="font-semibold text-white block">{item.description}</span>
                  <span className="text-[11px] text-slate-500">{item.date}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-rose-400 block text-sm">
                  - R$ {item.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Lançamento de Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">
              Lançar Gasto no Veículo
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria (I8)</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="compra">Compra / Aquisição</option>
                  <option value="documentacao">Documentação / Despachante / Laudo</option>
                  <option value="funilaria">Funilaria e Pintura</option>
                  <option value="mecanica">Mecânica e Revisão Geral</option>
                  <option value="pecas">Peças e Pneus</option>
                  <option value="estetica">Estética Automotiva / Higienização</option>
                  <option value="outros">Outros Gastos Operacionais</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de pastilhas de freio e óleo"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor da Despesa (R$)</label>
                <input
                  type="number"
                  required
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

