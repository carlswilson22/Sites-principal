import React, { useId } from 'react';
import { X, Instagram } from 'lucide-react';
import { useDialog } from './useDialog';
import { StoryPreview } from './StoryPreview';

export function StoryPublicationDialog({ publication, onClose }) {
  const ref = useDialog(onClose);
  const titleId = useId();
  return <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-publication-id={publication.id} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
    <section className="w-full max-w-3xl max-h-[92dvh] flex flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
      <header className="p-4 sm:p-5 flex items-start gap-3 border-b border-slate-800 shrink-0"><Instagram aria-hidden="true" className="w-5 h-5 text-pink-300 mt-1 shrink-0" /><div className="min-w-0 flex-1"><h2 id={titleId} className="font-semibold text-lg leading-tight text-white">{publication.status === 'sample_published' ? 'Publicação de exemplo' : 'Publicação do Story'}</h2><p className="mt-1 text-xs text-slate-400 break-words">@{publication.account || 'loja'} · {new Date(publication.created_at).toLocaleString('pt-BR')}</p></div><button type="button" aria-label="Fechar publicação" onClick={onClose} className="min-w-11 min-h-11 rounded-full bg-slate-800 inline-flex items-center justify-center text-slate-300 hover:text-white"><X aria-hidden="true" className="w-5 h-5" /></button></header>
      <div className="overflow-y-auto min-h-0 p-4 sm:p-6 grid md:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start"><div className="w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border border-slate-700"><StoryPreview story={publication.story} /></div><div className="min-w-0 space-y-4"><div><h3 className="font-semibold text-white">{publication.story.vehicle.title}</h3><p className="mt-2 text-xs text-emerald-300">{publication.status === 'sample_published' ? 'Publicado na prévia da conta de exemplo' : publication.status}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Legenda publicada</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{publication.caption || 'Sem legenda.'}</p></div><p className="text-xs leading-relaxed text-slate-400">Esta é a versão salva no momento da publicação, com a arte e a legenda originais.</p><button type="button" onClick={onClose} className="min-h-11 px-4 rounded-xl bg-slate-800 text-sm text-white">Voltar ao histórico</button></div></div>
    </section>
  </div>;
}
