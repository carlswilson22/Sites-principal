import React, { useEffect, useRef, useState } from 'react';
import { Download, Share2, Instagram, CheckCircle2, LoaderCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { normalizeVehicle } from '../utils/vehicles.js';
import { createStoryPng, downloadBlob, storyTemplates } from '../utils/storyArt.js';
import { StoryPreview } from '../components/common/StoryPreview';
import { StoryPublicationDialog } from '../components/common/StoryPublicationDialog';

export function StoryStudioView({ dealership = {}, storeKey = 'apexluxury', vehicles = [] }) {
  const catalog = vehicles.map(normalizeVehicle);
  const makeVehicle = vehicle => ({ ...vehicle, entry: vehicle.parcela?.entrada || Math.round(vehicle.price * 0.3), installment: vehicle.parcela?.valor || 1500 });
  const [vehicle, setVehicle] = useState(() => makeVehicle(catalog[0] || { id: '', title: '', price: 0, year: '', km: 0, photos: [] }));
  const [template, setTemplate] = useState('apex_minimal');
  const [priceMode, setPriceMode] = useState('preco_cheio');
  const [framing, setFraming] = useState('cover');
  const [cover, setCover] = useState(0);
  const [caption, setCaption] = useState('Conheça os detalhes desta seleção e fale com nossa equipe.');
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [published, setPublished] = useState(null);
  const [activePublication, setActivePublication] = useState(null);
  const [busy, setBusy] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const lock = useRef(false);
  const mounted = useRef(true);
  const photos = [...new Set([vehicle.cover_photo, ...(vehicle.photos || [])].filter(Boolean))];
  const ordered = photos.length ? [photos[cover] || photos[0], ...photos.filter((_, index) => index !== cover)].slice(0, 3) : [];
  const story = { storeName: dealership.nome || 'Enterprise Veículos', vehicle: { id: vehicle.id, title: vehicle.title, year: vehicle.year, km: vehicle.km, price: vehicle.price, entry: vehicle.entry, installment: vehicle.installment }, photos: ordered, template, priceMode, framing };
  useEffect(() => {
    mounted.current = true;
    Promise.all([apiClient.getInstagramStatus(storeKey), apiClient.getInstagramHistory(storeKey)])
      .then(([nextStatus, publications]) => { if (mounted.current) { setStatus(nextStatus); setHistory(publications); } })
      .catch(failure => { if (mounted.current) setError(failure.message); });
    return () => { mounted.current = false; };
  }, [storeKey]);
  const perform = async (action, task) => {
    if (lock.current) return;
    lock.current = true; setBusy(action); setError(''); setFeedback('');
    try { await task(); } catch (failure) { if (mounted.current && failure.name !== 'AbortError') setError(failure.message || 'Não foi possível concluir a ação.'); }
    finally { lock.current = false; if (mounted.current) setBusy(''); }
  };
  const publish = () => perform('publish', async () => {
    if (!story.photos.length || !story.vehicle.title.trim()) throw new Error('Escolha um veículo e uma foto antes de publicar.');
    const result = await apiClient.publishInstagramStory({ vehicle_id: vehicle.id, imageUrl: ordered[0], caption, story }, storeKey);
    if (!result.success) throw new Error(result.message || result.error || 'A publicação não foi concluída.');
    const nextHistory = await apiClient.getInstagramHistory(storeKey);
    if (mounted.current) { setHistory(nextHistory); setPublished(result.publication || null); setFeedback(result.message || 'Publicação enviada.'); }
  });
  const exportStory = share => perform(share ? 'share' : 'download', async () => {
    const blob = await createStoryPng(story);
    const filename = `story-${vehicle.id || 'veiculo'}-1080x1920.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    if (share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: vehicle.title, text: caption });
    else { downloadBlob(blob, filename); if (mounted.current) setFeedback(share ? 'Arte baixada. Compartilhe o arquivo no aplicativo de sua preferência.' : 'Arte PNG gerada em 1080 × 1920.'); }
  });
  const input = 'w-full min-h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white';
  const panel = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4';
  const disabled = Boolean(busy) || !ordered.length;
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-white">Estúdio de Stories 1080p & Instagram</h1><p className="mt-1 text-sm text-slate-400">Escolha um veículo, crie uma arte vertical e acompanhe sua publicação.</p></div>
    {error && <p role="alert" className="rounded-xl bg-rose-950/60 p-4 text-rose-200">{error}</p>}
    {feedback && <p role="status" className="rounded-xl bg-emerald-950/60 p-4 text-emerald-200">{feedback}</p>}
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div className="space-y-5">
        <section className={panel} aria-label="Dados do Story"><h2 className="font-semibold text-white">1. Veículo e condições</h2>
          <label className="block text-sm text-slate-300 space-y-2"><span>Veículo do estoque</span><select aria-label="Veículo do Story" className={input} value={vehicle.id} onChange={event => { const selected = catalog.find(item => String(item.id) === event.target.value); if (selected) { setVehicle(makeVehicle(selected)); setCover(0); } }}>{!catalog.length && <option value="">Nenhum veículo cadastrado</option>}{catalog.map(item => <option key={item.id} value={item.id}>{item.title} · {item.year}</option>)}</select></label>
          <label className="block text-sm text-slate-300 space-y-2"><span>Título da arte</span><input maxLength={90} className={input} value={vehicle.title} onChange={event => setVehicle({ ...vehicle, title: event.target.value })} /></label>
          <label className="block text-sm text-slate-300 space-y-2"><span>Exibição de preço</span><select className={input} value={priceMode} onChange={event => setPriceMode(event.target.value)}><option value="preco_cheio">Preço à vista</option><option value="entrada_parcelas">Entrada e 48 parcelas</option><option value="sem_preco">Consulte condições</option></select></label>
          {priceMode !== 'sem_preco' && <div className="grid sm:grid-cols-2 gap-3">{(priceMode === 'preco_cheio' ? [['price', 'Valor à vista (R$)']] : [['entry', 'Entrada (R$)'], ['installment', 'Parcela mensal (R$)']]).map(([key, label]) => <label key={key} className="text-sm text-slate-300 space-y-2"><span>{label}</span><input type="number" min="0" className={input} value={vehicle[key]} onChange={event => setVehicle({ ...vehicle, [key]: Math.max(0, Number(event.target.value)) })} /></label>)}</div>}
          <label className="block text-sm text-slate-300 space-y-2"><span>Foto de abertura</span><select className={input} value={cover} onChange={event => setCover(Number(event.target.value))}>{photos.map((_, index) => <option key={index} value={index}>Foto {index + 1}</option>)}</select></label>
        </section>
        <section className={panel} aria-label="Estilo do Story"><h2 className="font-semibold text-white">2. Layout da arte</h2>
          <div className="grid sm:grid-cols-3 gap-2">{storyTemplates.map(item => <button key={item.id} type="button" aria-pressed={template === item.id} onClick={() => setTemplate(item.id)} className={`min-h-12 p-3 text-sm rounded-xl border ${template === item.id ? 'border-cyan-300 bg-cyan-300/10 text-cyan-200' : 'border-slate-700 text-slate-300'}`}>{item.name}</button>)}</div>
          {template === 'showcase_trio' && ordered.length > 0 && ordered.length < 3 && <p className="text-xs text-slate-400">Este veículo tem {ordered.length} foto(s). A capa completa os espaços restantes da composição.</p>}
          <label className="block text-sm text-slate-300 space-y-2"><span>Enquadramento</span><select className={input} value={framing} onChange={event => setFraming(event.target.value)}><option value="cover">Preencher a foto</option><option value="contain">Manter a foto inteira</option></select></label>
        </section>
        <section className={panel} aria-label="Publicação no Instagram"><div className="flex flex-wrap items-center gap-3"><Instagram aria-hidden="true" className="text-pink-300" /><h2 className="font-semibold text-white">Publicação direta no Instagram</h2><span className="text-xs rounded-full px-3 py-1 bg-cyan-300/10 text-cyan-200">{status?.demo ? 'Conta de exemplo' : status?.configured ? 'Conta conectada' : 'Carregando conta'}</span></div>
          {status?.demo && <p className="text-sm text-slate-400">@{status.account} · Publique e use Ver publicação no histórico para abrir o Story. Os envios ficam neste navegador.</p>}
          <label className="block text-sm text-slate-300 space-y-2"><span>Legenda</span><textarea className={input} rows={3} maxLength={2200} value={caption} onChange={event => setCaption(event.target.value)} /></label>
          <div className="flex flex-wrap gap-3"><button type="button" disabled={disabled} onClick={() => exportStory(false)} className="min-h-11 inline-flex items-center gap-2 px-4 rounded-xl bg-slate-800 text-white disabled:opacity-50"><Download className="w-4 h-4" />{busy === 'download' ? 'Gerando PNG…' : 'Baixar PNG 1080 × 1920'}</button><button type="button" disabled={disabled} onClick={() => exportStory(true)} className="min-h-11 inline-flex items-center gap-2 px-4 rounded-xl bg-slate-800 text-white disabled:opacity-50"><Share2 className="w-4 h-4" />Compartilhar arte</button><button type="button" disabled={disabled || !status || (!status.demo && !status.configured)} onClick={publish} className="min-h-11 inline-flex items-center gap-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50">{busy === 'publish' ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}{busy === 'publish' ? 'Publicando…' : 'Publicar Story'}</button></div>
          {published && <ol aria-label="Etapas da publicação" className="space-y-2 text-sm text-emerald-200">{['Arte preparada', 'Publicação processada', 'Disponível na prévia da conta'].map(step => <li key={step} className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4" />{step}</li>)}</ol>}
        </section>
      </div>
      <aside className="space-y-3 lg:sticky lg:top-6"><p className="text-sm font-semibold text-slate-300">Prévia da arte · 9:16</p><div className="rounded-3xl border-4 border-slate-700 bg-slate-950 p-2 w-full max-w-[344px] mx-auto"><StoryPreview story={story} /></div></aside>
    </div>
    <section className={panel}><h2 className="text-lg font-semibold text-white">Histórico de publicações</h2>{!history.length && <p className="text-sm text-slate-400">Sua primeira publicação aparecerá aqui. Escolha uma arte e clique em Publicar Story.</p>}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{history.map(item => <article key={item.id} className="rounded-xl border border-slate-700 p-4 space-y-2"><p className="font-semibold text-white">{item.story?.vehicle.title || item.vehicle_title}</p><p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString('pt-BR')}</p><p className="text-xs text-cyan-200">{item.status === 'sample_published' ? 'Publicado na prévia' : item.status}</p>{item.story && <button type="button" aria-haspopup="dialog" onClick={() => setActivePublication(item)} className="min-h-11 text-sm text-pink-200 underline underline-offset-4">Ver publicação</button>}</article>)}</div>
    </section>
    {activePublication?.story && <StoryPublicationDialog publication={activePublication} onClose={() => setActivePublication(null)} />}
  </div>;
}
