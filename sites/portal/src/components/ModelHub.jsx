import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LayoutDashboard, Store, X } from 'lucide-react';
import { ModelPreview } from './ModelPreview';

const accents = {
  'auto-dealership': { label: 'text-blue-700', icon: 'bg-blue-50 text-blue-700', button: 'bg-blue-700 hover:bg-blue-800' },
  'luxury-dealership': { label: 'text-amber-800', icon: 'bg-amber-50 text-amber-800', button: 'bg-amber-800 hover:bg-amber-900' },
  'popular-dealership': { label: 'text-cyan-700', icon: 'bg-cyan-50 text-cyan-700', button: 'bg-cyan-700 hover:bg-cyan-800' },
};

export default function ModelHub({ model }) {
  const [panelRevision, setPanelRevision] = useState(0);
  const showPanel = panelRevision > 0;
  const panelButton = useRef(null);
  const panel = useRef(null);
  const accent = accents[model.id] || accents['auto-dealership'];
  const siteUrl = `${import.meta.env.BASE_URL}${model.path}`;

  useEffect(() => {
    if (!showPanel) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [showPanel, panelRevision]);

  function closePanel() {
    setPanelRevision(0);
    panelButton.current?.focus();
  }

  return <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-7 sm:py-12">
    <div className="mx-auto max-w-5xl">
      <a href={import.meta.env.BASE_URL} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar aos modelos
      </a>
      <div className="mt-6 grid items-center gap-7 md:grid-cols-[1fr_19rem] md:gap-12">
        <div>
          <p className={`text-sm font-bold uppercase tracking-wider ${accent.label}`}>Demonstração · {model.badge}</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{model.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{model.tagline}</p>
          <p className="mt-5 text-base leading-relaxed text-slate-600">Escolha como deseja conhecer este modelo.</p>
        </div>
        <div className="hidden h-48 overflow-hidden rounded-2xl border border-slate-200 shadow-sm md:block"><ModelPreview model={model} /></div>
      </div>

      <div className="mt-9 grid gap-5 md:grid-cols-2" aria-label="Opções da demonstração">
        <section aria-labelledby="demo-site-title" className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accent.icon}`}><Store className="h-6 w-6" aria-hidden="true" /></span>
          <h2 id="demo-site-title" className="mt-5 text-xl font-bold">Conhecer o site</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">Explore a vitrine e as funcionalidades disponíveis para os clientes da loja.</p>
          <a href={siteUrl} className={`mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${accent.button}`}>
            Acessar o site <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </section>
        <section aria-labelledby="demo-panel-title" className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accent.icon}`}><LayoutDashboard className="h-6 w-6" aria-hidden="true" /></span>
          <h2 id="demo-panel-title" className="mt-5 text-xl font-bold">Painel do lojista</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">Faça login para conhecer as ferramentas de gestão da loja neste portal.</p>
          <button ref={panelButton} type="button" aria-expanded={showPanel} aria-controls="model-merchant-panel" onClick={() => setPanelRevision(revision => revision + 1)} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            Fazer login no painel <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </section>
      </div>

      {showPanel && <section ref={panel} id="model-merchant-panel" aria-label={`Painel do lojista: ${model.title}`} className="mt-7 scroll-mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">Painel do lojista · {model.title}</h2>
          <button type="button" onClick={closePanel} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><X className="h-4 w-4" aria-hidden="true" /> Fechar painel</button>
        </div>
        <iframe key={panelRevision} title={`Painel do lojista: ${model.title}`} src={`${siteUrl}#painel-lojista`} className="block h-[75vh] min-h-[36rem] w-full bg-white" />
      </section>}
    </div>
  </main>;
}
