import React, { useEffect, useMemo, useState } from 'react';
import { siteAnalytics, summarizeAnalytics } from '../services/siteAnalytics.js';
import { storeSync } from '../services/storeSync';
import { useAuth } from '../context/AuthContext';

export function AnalyticsView({ storeKey = 'autoelite', vehicles = [] }) {
  const { hasRole } = useAuth();
  const allowed = hasRole(['gerente']);
  const [events, setEvents] = useState([]);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!allowed) return;
    try { setEvents(siteAnalytics.getEvents(storeKey)); setError(''); }
    catch { setError('Não foi possível carregar as métricas deste navegador.'); }
    return storeSync.subscribe(storeKey, detail => {
      if (detail.type === 'ANALYTICS_UPDATED') { setEvents(detail.analytics); setError(''); }
    });
  }, [storeKey, allowed]);
  const summary = useMemo(() => summarizeAnalytics(events, vehicles, days), [events, vehicles, days]);
  if (!allowed) return <p role="alert" className="p-6 text-slate-300">Métricas disponíveis para gerente e proprietário.</p>;
  return <section className="space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5">
      <div><h1 className="text-2xl font-bold text-white">Métricas do site</h1>
        <p className="text-sm text-slate-400 mt-2">Interações registradas nesta loja e neste navegador. Não representam visitantes únicos nem o tráfego de outros dispositivos.</p></div>
      <label className="text-sm text-slate-300">Período
        <select value={days} onChange={event => setDays(Number(event.target.value))} className="ml-3 p-3 bg-slate-900 border border-slate-700 rounded-xl">
          {[7, 30, 90].map(value => <option key={value} value={value}>Últimos {value} dias</option>)}
        </select>
      </label>
    </div>
    {error && <p role="alert" className="text-rose-300">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-3">
      {[["Páginas visualizadas", summary.pageViews], ["Anúncios abertos", summary.vehicleViews], ["Cliques no WhatsApp", summary.whatsappClicks]].map(([label, value]) => <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p className="text-sm text-slate-400">{label}</p><p className="text-3xl font-bold text-white mt-2">{value.toLocaleString('pt-BR')}</p>
      </div>)}
    </div>
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
      <h2 className="text-lg font-bold text-white mb-4">Veículos com mais interesse</h2>
      {!summary.ranking.length ? <p className="text-sm text-slate-400">Ainda não há interações com anúncios neste período. Abra a vitrine e um veículo para começar.</p> : <table className="w-full text-left text-sm">
        <thead><tr className="text-slate-400"><th className="p-3">Veículo</th><th className="p-3">Anúncios abertos</th><th className="p-3">WhatsApp</th></tr></thead>
        <tbody>{summary.ranking.slice(0, 20).map(item => <tr key={item.id} className="border-t border-slate-800 text-slate-200"><td className="p-3">{item.title}</td><td className="p-3">{item.views}</td><td className="p-3">{item.whatsapp}</td></tr>)}</tbody>
      </table>}
    </div>
    <p className="text-xs text-slate-400">Os registros guardam apenas tipo de interação, página, código do veículo e data, por até 90 dias e no máximo 10 mil eventos. Nomes, telefones e mensagens não são coletados nestas métricas.</p>
  </section>;
}
