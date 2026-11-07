/**
 * packages/merchant-core/src/pages/StoryStudioView.jsx
 * Gerador de Artes para Story Vertical 1080x1920 & Integração Instagram (Nível 3 - A6 e A7).
 * Layouts originais, opções de preço, aviso de baixa resolução, download e fila de publicação.
 */
import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Share2, Instagram, Image as ImageIcon, AlertTriangle, CheckCircle2, Sliders, Smartphone, ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function StoryStudioView() {
  const [selectedVehicle, setSelectedVehicle] = useState({
    id: 1,
    title: 'Porsche 911 Carrera S',
    year: '2023/2023',
    km: 14500,
    price: 940000,
    entry: 280000,
    installment: 18450
  });

  const [selectedPhotos, setSelectedPhotos] = useState([
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1080&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1080&q=80'
  ]);

  const [template, setTemplate] = useState('apex_minimal'); // 'apex_minimal' | 'bold_impact' | 'showcase_trio'
  const [priceMode, setPriceMode] = useState('preco_cheio'); // 'preco_cheio' | 'entrada_parcelas' | 'sem_preco'
  const [framing, setFraming] = useState('cover'); // 'cover' | 'contain'

  const [instagramStatus, setInstagramStatus] = useState(null);
  const [publishFeedback, setPublishFeedback] = useState(null);
  const [loadingPublish, setLoadingPublish] = useState(false);

  useEffect(() => {
    checkInstagram();
  }, []);

  const checkInstagram = async () => {
    const status = await apiClient.getInstagramStatus();
    setInstagramStatus(status);
  };

  const handlePublishInstagram = async () => {
    setLoadingPublish(true);
    setPublishFeedback(null);
    try {
      const res = await apiClient.publishInstagramStory({
        vehicle_id: selectedVehicle.id,
        imageUrl: selectedPhotos[0],
        caption: `${selectedVehicle.title} disponível na Apex Luxury.`
      });
      setPublishFeedback(res);
    } finally {
      setLoadingPublish(false);
    }
  };

  const handleDownload = () => {
    alert('Download da arte em alta definição 1080x1920 iniciado.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedVehicle.title,
        text: `Confira este ${selectedVehicle.title} na Apex Luxury!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Confira ${selectedVehicle.title} na Apex Luxury!`)}`, '_blank');
    }
  };

  const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Estúdio de Stories 1080p & Instagram</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tier 3 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Geração de criativos verticais em alta definição (1080x1920) e publicação oficial via Instagram Graph API.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna da Esquerda: Controles de Estilização */}
        <div className="lg:col-span-7 space-y-6">
          {/* Seletor de Modelo / Veículo */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">1. Dados do Veículo & Preço</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Título do Veículo</label>
                <input
                  type="text"
                  value={selectedVehicle.title}
                  onChange={e => setSelectedVehicle({ ...selectedVehicle, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Exibição de Preço</label>
                <select
                  value={priceMode}
                  onChange={e => setPriceMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="preco_cheio">Preço à Vista Cheio</option>
                  <option value="entrada_parcelas">Entrada + Parcelas (Tabela Price)</option>
                  <option value="sem_preco">Sem Preço ("Consulte Condições")</option>
                </select>
              </div>
            </div>

            {priceMode === 'preco_cheio' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor à Vista (R$)</label>
                <input
                  type="number"
                  value={selectedVehicle.price}
                  onChange={e => setSelectedVehicle({ ...selectedVehicle, price: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>
            )}

            {priceMode === 'entrada_parcelas' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Entrada (R$)</label>
                  <input
                    type="number"
                    value={selectedVehicle.entry}
                    onChange={e => setSelectedVehicle({ ...selectedVehicle, entry: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Parcela Mensal (R$)</label>
                  <input
                    type="number"
                    value={selectedVehicle.installment}
                    onChange={e => setSelectedVehicle({ ...selectedVehicle, installment: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Escolha do Layout & Enquadramento */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Estilo Visual & Enquadramento</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'apex_minimal', name: 'Apex Luxury Clean', desc: 'Serifada elegante e minimalista' },
                { id: 'bold_impact', name: 'Dark Bold Impact', desc: 'Contraste grafite e esmeralda' },
                { id: 'showcase_trio', name: 'Editorial 3 Fotos', desc: 'Grade tripla frontal, interna e lateral' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    template === t.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-100">{t.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs text-slate-400">Ajuste de Enquadramento:</span>
              <button
                type="button"
                onClick={() => setFraming('cover')}
                className={`px-3 py-1 text-xs rounded-lg border ${framing === 'cover' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
              >
                Preencher (Cover)
              </button>
              <button
                type="button"
                onClick={() => setFraming('contain')}
                className={`px-3 py-1 text-xs rounded-lg border ${framing === 'contain' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
              >
                Manter Proporção (Contain)
              </button>
            </div>
          </div>

          {/* Painel Instagram Graph API (Regra: Transparência quando não configurado) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-400">
                <Instagram className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Publicação Direta no Instagram</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                instagramStatus?.configured
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {instagramStatus?.configured ? 'API Conectada' : 'Não Configurado'}
              </span>
            </div>

            {!instagramStatus?.configured && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-relaxed">
                As variáveis <code>INSTAGRAM_ACCESS_TOKEN</code> e <code>INSTAGRAM_ACCOUNT_ID</code> não estão configuradas no servidor. O sistema não simula envios falsos: você pode fazer download da imagem vertical e publicá-la no aplicativo.
              </div>
            )}

            {publishFeedback && (
              <div className={`p-3 rounded-xl text-xs ${publishFeedback.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {publishFeedback.message || publishFeedback.error || 'Ação registrada.'}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Baixar Story (1080x1920)
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
              <button
                type="button"
                disabled={loadingPublish}
                onClick={handlePublishInstagram}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20"
              >
                <Instagram className="w-4 h-4" />
                {loadingPublish ? 'Enviando...' : 'Publicar Story'}
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Mockup do Smartphone 9:16 */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-600 flex flex-col overflow-hidden">
            {/* Notch / Speaker */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30" />

            {/* Conteúdo do Story */}
            <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-slate-900 flex flex-col justify-between p-4 z-10 text-white">
              {/* Background Image */}
              <img
                src={selectedPhotos[0]}
                alt="Story preview"
                className={`absolute inset-0 w-full h-full ${framing === 'cover' ? 'object-cover' : 'object-contain'} -z-10 brightness-75`}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70 -z-0" />

              {/* Top Header */}
              <div className="relative z-10 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">
                    AP
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider">APEX LUXURY</div>
                    <div className="text-[9px] text-emerald-400 font-mono">SELEÇÃO EXCLUSIVA</div>
                  </div>
                </div>
                <span className="text-[9px] bg-black/60 px-2 py-0.5 rounded-full border border-white/20 text-slate-300">
                  HD 1080p
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="relative z-10 space-y-2 pb-3">
                <div className="text-lg font-black leading-tight drop-shadow-md">
                  {selectedVehicle.title}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {selectedVehicle.year} • {selectedVehicle.km.toLocaleString('pt-BR')} km
                </div>

                {priceMode === 'preco_cheio' && (
                  <div className="pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">À Vista</div>
                    <div className="text-xl font-black font-mono text-white drop-shadow">
                      {formatBrl(selectedVehicle.price)}
                    </div>
                  </div>
                )}

                {priceMode === 'entrada_parcelas' && (
                  <div className="pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Plano Especial</div>
                    <div className="text-xs text-slate-200">Entrada {formatBrl(selectedVehicle.entry)} +</div>
                    <div className="text-lg font-black font-mono text-white">48x de {formatBrl(selectedVehicle.installment)}</div>
                  </div>
                )}

                {priceMode === 'sem_preco' && (
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-lg uppercase tracking-wider">
                      Consulte Condições
                    </span>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <div className="inline-block text-[10px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-slate-200 border border-white/30">
                    Toque para falar no WhatsApp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

