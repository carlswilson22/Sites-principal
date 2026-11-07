/**
 * packages/merchant-core/src/pages/AdvancedContractsView.jsx
 * Emissão de Contratos Avançados (Nível 3 - A2):
 * - Consignação Mercantil
 * - Compra e Venda com Dação de Veículo em Pagamento (Troca)
 * - Termo Aditivo vinculado ao contrato original com numeração automática
 */
import React, { useState } from 'react';
import { FileText, ShieldAlert, Printer, Share2, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function AdvancedContractsView() {
  const [contractType, setContractType] = useState('consignacao');
  const [vehicleId, setVehicleId] = useState('3');
  const [clientId, setClientId] = useState('1');
  const [parentContractId, setParentContractId] = useState('');
  const [tradeVehicleTitle, setTradeVehicleTitle] = useState('Sedan Antigo 2018');
  const [tradeValue, setTradeValue] = useState(38000);
  const [tradeHasDebt, setTradeHasDebt] = useState(false);
  const [tradeDebtAmount, setTradeDebtAmount] = useState(0);
  const [amendmentReason, setAmendmentReason] = useState('Prorrogação de vigência da consignação por mais 30 dias corridos e repactuação de taxa de guarda.');
  const [witness1Name, setWitness1Name] = useState('Mariana Testemunha Fictícia');
  const [witness1Cpf, setWitness1Cpf] = useState('111.222.333-44');
  const [witness2Name, setWitness2Name] = useState('Lucas Testemunha Fictícia');
  const [witness2Cpf, setWitness2Cpf] = useState('555.666.777-88');

  const [previewHtml, setPreviewHtml] = useState(null);
  const [contractCode, setContractCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.createAdvancedContract({
        type: contractType,
        vehicle_id: parseInt(vehicleId, 10),
        client_id: parseInt(clientId, 10),
        parent_contract_id: parentContractId ? parseInt(parentContractId, 10) : null,
        tradeVehicle: contractType === 'compra_venda_troca' ? { title: tradeVehicleTitle, year: '2018' } : null,
        terms: {
          tradeValue: Number(tradeValue),
          tradeHasDebt,
          tradeDebtAmount: Number(tradeDebtAmount),
          amendmentReason,
          witness1_name: witness1Name,
          witness1_cpf: witness1Cpf,
          witness2_name: witness2Name,
          witness2_cpf: witness2Cpf
        }
      });
      setPreviewHtml(res.html);
      setContractCode(res.code);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(previewHtml);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`Olá! Segue a minuta do instrumento contratual (${contractCode}) gerada pelo nosso sistema. Lembramos que deve ser revisada por advogado habilitado.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Contratos Avançados & Aditivos</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tier 3 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Geração de instrumentos formais de consignação, compra e venda com troca, e termos aditivos numerados.
          </p>
        </div>
      </div>

      {/* Alerta Legal Mandatório */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-red-200/90 leading-relaxed">
          <strong className="text-red-300 font-semibold uppercase">Aviso Legal Obrigatório:</strong> As minutas geradas pela plataforma são modelos operacionais genéricos. Em cumprimento às normas de conformidade jurídica, devem ser obrigatoriamente submetidas à análise e validação de um advogado habilitado antes da coleta de assinaturas e utilização comercial.
        </div>
      </div>

      {/* Formulário de Configuração do Contrato */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de Instrumento</label>
              <select
                value={contractType}
                onChange={e => setContractType(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="consignacao">Consignação Mercantil (Terceiros)</option>
                <option value="compra_venda_troca">Compra e Venda com Veículo na Troca</option>
                <option value="termo_aditivo">Termo Aditivo (Vinculado a Contrato)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ID do Veículo Principal</label>
              <input
                type="number"
                required
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ID do Cliente Cadastrado</label>
              <input
                type="number"
                required
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Campos específicos para Troca */}
          {contractType === 'compra_venda_troca' && (
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Dados do Veículo Dado na Troca</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Modelo / Ano do Carro</label>
                  <input
                    type="text"
                    value={tradeVehicleTitle}
                    onChange={e => setTradeVehicleTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor de Avaliação (R$)</label>
                  <input
                    type="number"
                    value={tradeValue}
                    onChange={e => setTradeValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Possui Dívida / Gravame?</label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={tradeHasDebt}
                        onChange={e => setTradeHasDebt(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500"
                      />
                      Sim, com saldo devedor
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para Termo Aditivo */}
          {contractType === 'termo_aditivo' && (
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Vínculo ao Contrato Original</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ID do Contrato Pai (Original)</label>
                  <input
                    type="number"
                    required
                    value={parentContractId}
                    onChange={e => setParentContractId(e.target.value)}
                    placeholder="Ex: 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Justificativa e Alterações do Aditivo</label>
                  <input
                    type="text"
                    value={amendmentReason}
                    onChange={e => setAmendmentReason(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção de Testemunhas */}
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Testemunhas Qualificadas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">1ª Testemunha (Nome e CPF)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={witness1Name}
                    onChange={e => setWitness1Name(e.target.value)}
                    placeholder="Nome"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={witness1Cpf}
                    onChange={e => setWitness1Cpf(e.target.value)}
                    placeholder="CPF mascarado"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">2ª Testemunha (Nome e CPF)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={witness2Name}
                    onChange={e => setWitness2Name(e.target.value)}
                    placeholder="Nome"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={witness2Cpf}
                    onChange={e => setWitness2Cpf(e.target.value)}
                    placeholder="CPF mascarado"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Gerando Minuta Contratual...' : 'Gerar e Emitir Minuta Contratual'}
          </button>
        </form>
      </div>

      {/* Painel de Pré-visualização e Ações */}
      {previewHtml && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Minuta Emitida: {contractCode}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Pronta para impressão, exportação em PDF e compartilhamento.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir / PDF
              </button>
              <button
                onClick={handleShareWhatsapp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Enviar WhatsApp
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 text-slate-900 max-h-[500px] overflow-y-auto font-serif shadow-inner">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
