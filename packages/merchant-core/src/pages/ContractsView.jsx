/**
 * packages/merchant-core/src/pages/ContractsView.jsx
 * Emissão de Contratos Básicos, Recibos e Termos de Vistoria (I7 - Nível 2)
 */
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Printer, Share2, CheckCircle2, AlertTriangle, Eye, X, ShieldAlert } from 'lucide-react';
import { storeSync } from '../services/storeSync';
import { generateContractDocument } from '../utils/contracts';

export function ContractsView({ storeKey = 'autoelite', selectedClient = null, vehicles = [], dealership = { nome: 'Concessionária' } }) {
  const [error, setError] = useState('');
  const [contracts, setContracts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [formData, setFormData] = useState({
    type: 'compra_venda',
    clientId: null,
    clientName: '',
    clientCpf: '',
    clientPhone: '',
    clientAddress: '',
    vehicleTitle: '',
    vehiclePrice: 0,
    vehicleYear: '',
    signalValue: 10000
  });

  useEffect(() => {
    setError('');
    try { setContracts(storeSync.getRecords(storeKey, 'contracts')); }
    catch { setContracts([]); setError('Não foi possível carregar os documentos deste navegador.'); }
    return storeSync.subscribe(storeKey, detail => {
      if (detail.type === 'CONTRACTS_UPDATED') setContracts(detail.contracts);
    });
  }, [storeKey]);

  useEffect(() => {
    if (!selectedClient) return;
    setFormData(previous => ({ ...previous, clientId: selectedClient.id ?? null, clientName: selectedClient.name, clientCpf: selectedClient.cpfMasked || '', clientPhone: selectedClient.phone || '', clientAddress: selectedClient.address || '' }));
    setIsModalOpen(true);
  }, [selectedClient]);

  const handleClientChange = (field, value) => {
    setFormData(previous => ({
      ...previous,
      [field]: value,
      clientId: null,
      ...(previous.clientId != null ? { clientCpf: '', clientAddress: '' } : {})
    }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();

    const doc = generateContractDocument({
      type: formData.type,
      dealership,
      client: { name: formData.clientName, cpfMasked: formData.clientCpf, address: formData.clientAddress || '' },
      vehicle: {
        title: formData.vehicleTitle,
        version: '',
        year: formData.vehicleYear,
        color: formData.vehicleColor || '',
        km: formData.vehicleKm || 0,
        price: formData.vehiclePrice,
        transmission: formData.vehicleTransmission || '',
        fuel: formData.vehicleFuel || ''
      },
      terms: { signalValue: formData.signalValue }
    });

    const newContract = {
      code: doc.code,
      type: formData.type,
      typeLabel: formData.type === 'compra_venda' ? 'Compra e Venda' : formData.type === 'recibo_sinal' ? 'Recibo de Sinal' : 'Termo de Vistoria',
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientId: formData.clientId,
      vehicleTitle: formData.vehicleTitle,
      value: formData.type === 'recibo_sinal' ? formData.signalValue : formData.vehiclePrice,
      status: 'emitido',
      date: new Date().toLocaleDateString('pt-BR'),
      doc
    };

    try {
      setContracts(storeSync.saveRecord(storeKey, 'contracts', newContract));
      setError('');
    } catch {
      setError('Não foi possível salvar o documento. Verifique o armazenamento do navegador.');
      return;
    }
    setIsModalOpen(false);
    setPreviewDoc(doc);
  };

  const handlePrint = () => {
    if (!previewDoc) return;
    const frame = document.createElement('iframe');
    frame.title = 'Impressão do documento';
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;';
    frame.onload = () => {
      const printWindow = frame.contentWindow;
      printWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
      printWindow.focus();
      printWindow.print();
    };
    frame.srcdoc = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Documento</title></head><body>${previewDoc.html}</body></html>`;
    document.body.appendChild(frame);
  };

  const handleShareWhatsApp = (contract) => {
    const text = `Olá ${contract.clientName}! Segue a via digital do seu documento (${contract.typeLabel} - Código: ${contract.code}) emitido pela concessionária.`;
    const phone = (contract.clientPhone || '').replace(/\D/g, '');
    if (!phone) return;
    const url = `https://wa.me/${phone.length <= 11 ? '55' + phone : phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-amber-400" />
              Contratos & Vistorias (I7)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Emissão de Compra e Venda, Recibo de Sinal e Termo de Vistoria com conferência de itens.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Emitir Novo Documento
        </button>
      </div>

      {/* Aviso Jurídico Obrigatório */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Aviso de Conformidade Jurídica:</strong> Os modelos gerados pelo sistema possuem redação referencial genérica. Devem ser expressamente revisados por seu advogado ou departamento jurídico antes de formalização comercial.
        </span>
      </div>

      {/* 2. Tabela de Contratos Emitidos */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {contracts.length === 0 && <p className="p-5 text-sm text-slate-400">Nenhum documento emitido para esta loja.</p>}
          {contracts.map(contract => (
            <div key={contract.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{contract.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {contract.typeLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">• {contract.date}</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Cliente: <strong>{contract.clientName}</strong> • Veículo: {contract.vehicleTitle}
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                  Valor: R$ {contract.value?.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {contract.doc && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(contract.doc)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Visualizar e Imprimir"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Visualizar</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!contract.clientPhone}
                  onClick={() => handleShareWhatsApp(contract)}
                  className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Enviar via WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Modal de Emissão de Contrato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Emitir Documento Oficial
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3.5">
              {vehicles.length > 0 && <label className="block text-xs text-slate-300">
                Selecionar veículo cadastrado
                <select defaultValue="" onChange={event => {
                  const vehicle = vehicles.find(item => String(item.id) === event.target.value);
                  if (vehicle) setFormData(previous => ({ ...previous, vehicleTitle: vehicle.nome || vehicle.title, vehiclePrice: vehicle.preco ?? vehicle.price, vehicleYear: String(vehicle.ano ?? vehicle.year ?? ''), vehicleColor: vehicle.cor || vehicle.color, vehicleKm: vehicle.km, vehicleTransmission: vehicle.cambio || vehicle.transmission, vehicleFuel: vehicle.combustivel || vehicle.fuel }));
                }} className="mt-1 w-full p-2 rounded-xl bg-slate-900 border border-slate-700">
                  <option value="">Selecione um veículo</option>
                  {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.nome || vehicle.title}</option>)}
                </select>
              </label>}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Documento (I7)</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="compra_venda">Contrato de Compra e Venda de Veículo</option>
                  <option value="recibo_sinal">Recibo de Sinal de Negócio / Reserva</option>
                  <option value="vistoria_simples">Termo de Vistoria e Checklist de Entrega</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente Vinculado</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => handleClientChange('clientName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <label className="block text-xs text-slate-300">
                Telefone do cliente
                <input type="tel" value={formData.clientPhone} onChange={event => handleClientChange('clientPhone', event.target.value)} className="mt-1 w-full p-2 rounded-xl bg-slate-900 border border-slate-700" />
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Veículo do Estoque</label>
                <input
                  type="text"
                  required
                  value={formData.vehicleTitle}
                  onChange={(e) => setFormData({ ...formData, vehicleTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              {formData.type === 'recibo_sinal' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor do Sinal (R$)</label>
                  <input
                    type="number"
                    required min="0" step="0.01"
                    value={formData.signalValue}
                    onChange={(e) => setFormData({ ...formData, signalValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Total da Negociação (R$)</label>
                  <input
                    type="number"
                    value={formData.vehiclePrice}
                    onChange={(e) => setFormData({ ...formData, vehiclePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

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
                  Gerar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal de Visualização e Impressão / PDF */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">{previewDoc.title} ({previewDoc.code})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6" dangerouslySetInnerHTML={{ __html: previewDoc.html }} />
          </div>
        </div>
      )}
    </div>
  );
}

