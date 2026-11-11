/**
 * packages/merchant-core/src/pages/FullFinancialView.jsx
 * Financeiro Completo, Comissões & Relatório Bancário (Nível 3 - A3).
 * Visível exclusivamente para Proprietário e Gerente.
 */
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Download, Building, ShieldCheck, PieChart, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function FullFinancialView({ dealership = {} }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancial();
  }, []);

  const loadFinancial = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getFullFinancial();
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportPortalsCsv = () => {
    window.open('/api/tier3/portals/export?format=csv', '_blank');
  };

  const handleExportBankReport = () => {
    const report = data?.bankReport;
    if (!report) return;
    const content = `
=====================================================
RELATÓRIO CONSOLIDADO PARA INSTITUIÇÃO FINANCEIRA
EMISSOR: ${dealership.nome || report.storeName}
DATA DE EMISSÃO: ${new Date(report.generatedAt).toLocaleDateString('pt-BR')}
=====================================================
1. POSIÇÃO PATRIMONIAL DO ESTOQUE
- Total de Veículos em Pátio: ${report.activeInventoryCount} unidades
- Valor Total a Preço de Varejo: ${formatBrl(report.activeInventoryValue)}
- Capital Próprio Imobilizado: ${formatBrl(report.ownStockInvestedCapital)}

2. PERFORMANCE DOS ÚLTIMOS 12 MESES
- Receita Operacional Bruta: ${formatBrl(report.last12MonthsGrossRevenue)}
- Lucro Operacional Líquido Realizado: ${formatBrl(report.last12MonthsNetProfit)}
- Rating de Saúde Financeira: ${report.financialHealthIndex}
=====================================================
Este documento foi gerado pelo sistema de gestão da ${dealership.nome || 'loja'}.
    `;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_bancario_12m_${new Date().getFullYear()}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Carregando demonstrativo financeiro e comissões...
      </div>
    );
  }

  const { ownStock, consignedStock, salesMetrics, sellersCommissions, bankReport } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">DRE & Comissionamento</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Controle gerencial de estoque próprio vs. consignado, comissões de atendentes e relatório bancário anual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPortalsCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Catálogo Portais (CSV)
          </button>
          <button
            onClick={handleExportBankReport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Relatório p/ Banco (12M)
          </button>
        </div>
      </div>

      {/* Grid de Posição de Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Estoque Próprio</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {formatBrl(ownStock?.total_invested)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {ownStock?.count} carros próprios • Varejo: {formatBrl(ownStock?.total_retail_value)}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Estoque Consignado</span>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {formatBrl(consignedStock?.total_retail_value)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {consignedStock?.count} carros de terceiros sob gestão (risco zero de imobilizado)
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
            <span>Lucro Realizado (Vendas)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatBrl(salesMetrics?.totalRealizedProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {salesMetrics?.totalSoldCars} vendas • Receita: {formatBrl(salesMetrics?.totalSalesRevenue)}
          </div>
        </div>
      </div>

      {/* Tabela de Comissionamento por Atendente */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Comissionamento por Atendente / Vendedor
          </h3>
          <span className="text-xs text-slate-400">Regra: 1,5% sobre o valor faturado por venda</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Atendente</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Vendas Fechadas</th>
                <th className="px-5 py-3">Volume Vendido</th>
                <th className="px-5 py-3">Comissão Apurada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sellersCommissions?.map(s => (
                <tr key={s.sellerId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-200">{s.name}</td>
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{s.email}</td>
                  <td className="px-5 py-4 text-slate-200">{s.salesCount} carros</td>
                  <td className="px-5 py-4 font-mono text-slate-200">{formatBrl(s.totalSold)}</td>
                  <td className="px-5 py-4 font-mono font-bold text-emerald-400">{formatBrl(s.commissionAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Relatório Bancário Oficial */}
      {bankReport && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Dossiê Consolidado de Crédito (12 Meses)</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Rating {bankReport.financialHealthIndex}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Sumário auditado pronto para apresentação a instituições financeiras, cooperativas de crédito e bancos parceiros de financiamento de estoque (Floor Plan).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Giro de 12 Meses</span>
              <div className="text-base font-bold text-slate-200 font-mono mt-0.5">{formatBrl(bankReport.last12MonthsGrossRevenue)}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Lucro Líquido 12M</span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{formatBrl(bankReport.last12MonthsNetProfit)}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Estoque Total</span>
              <div className="text-base font-bold text-slate-200 font-mono mt-0.5">{bankReport.activeInventoryCount} veículos</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Valor em Pátio</span>
              <div className="text-base font-bold text-slate-200 font-mono mt-0.5">{formatBrl(bankReport.activeInventoryValue)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

