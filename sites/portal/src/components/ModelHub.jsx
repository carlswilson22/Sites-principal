import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LayoutDashboard, Store, X } from 'lucide-react';

const accents = {
  'auto-dealership': { label: 'text-blue-700', icon: 'bg-blue-50 text-blue-700', button: 'bg-blue-700 hover:bg-blue-800' },
  'luxury-dealership': { label: 'text-amber-800', icon: 'bg-amber-50 text-amber-800', button: 'bg-amber-800 hover:bg-amber-900' },
  'popular-dealership': { label: 'text-cyan-700', icon: 'bg-cyan-50 text-cyan-700', button: 'bg-cyan-700 hover:bg-cyan-800' },
};

const focusableSelector = 'a[href], button:not([disabled]), iframe, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ModelHub({ model, onClose, returnFocus }) {
  const [showPanel, setShowPanel] = useState(false);
  const [closing, setClosing] = useState(false);
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const backButton = useRef(null);
  const panelButton = useRef(null);
  const closeTimer = useRef(null);
  const accent = accents[model.id] || accents['auto-dealership'];
  const siteUrl = `${import.meta.env.BASE_URL}${model.path}`;

  useEffect(() => {
    const background = document.getElementById('portal-content');
    const previousOverflow = document.body.style.overflow;
    const previousFocus = returnFocus ? returnFocus.current : document.activeElement;
    background?.setAttribute('inert', '');
    background?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      } else if (event.key === 'Tab' && dialog.current) {
        const elements = Array.from(dialog.current.querySelectorAll(focusableSelector))
          .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
        if (!elements.length) {
          event.preventDefault();
          dialog.current.focus();
          return;
        }
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(closeTimer.current);
      background?.removeAttribute('inert');
      background?.removeAttribute('aria-hidden');
      document.body.style.overflow = previousOverflow;
      const cardLink = Array.from(document.querySelectorAll('.model-card a')).find(link => link.href.includes(`modelo=${encodeURIComponent(model.id)}`));
      const target = previousFocus && previousFocus !== document.body ? previousFocus : cardLink;
      target?.focus?.();
    };
  }, [model.id, onClose, returnFocus]);

  useEffect(() => {
    if (showPanel) backButton.current?.focus();
  }, [showPanel]);

  function requestClose() {
    if (closeTimer.current !== null) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      onClose();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, 180);
  }

  function returnToChoices() {
    setShowPanel(false);
    // The button is mounted again in the next render.
    requestAnimationFrame(() => panelButton.current?.focus());
  }

  return (
    <div className="model-dialog-overlay" data-closing={closing} onMouseDown={event => { if (event.target === event.currentTarget) requestClose(); }}>
      <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="model-demo-title" tabIndex={-1} className={`model-dialog ${showPanel ? 'model-dialog-panel' : ''}`}>
        <header className="model-dialog-header">
          <div className="min-w-0">
            <p className={`text-xs font-bold uppercase tracking-wider ${accent.label}`}>Demonstração · {model.badge}</p>
            <h2 id="model-demo-title" className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{model.title}</h2>
          </div>
          <button ref={closeButton} type="button" onClick={requestClose} aria-label="Fechar demonstração" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {showPanel ? (
          <div className="model-dialog-panel-content">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 sm:px-6">
              <button ref={backButton} type="button" onClick={returnToChoices} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar às opções
              </button>
              <span className="hidden text-sm font-semibold text-slate-600 sm:inline">Painel do lojista</span>
            </div>
            <iframe title={`Painel do lojista: ${model.title}`} src={`${siteUrl}#painel-lojista`} className="model-dialog-iframe" />
          </div>
        ) : (
          <div className="model-dialog-choices">
            <p className="text-sm leading-relaxed text-slate-600">Escolha como deseja conhecer este modelo.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <section aria-labelledby="demo-site-title" className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent.icon}`}><Store className="h-5 w-5" aria-hidden="true" /></span>
                <h3 id="demo-site-title" className="mt-4 text-lg font-bold">Conhecer o site</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">Explore a vitrine e as funcionalidades disponíveis para os clientes da loja.</p>
                <a href={siteUrl} className={`mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${accent.button}`}>
                  Acessar o site <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </section>
              <section aria-labelledby="demo-panel-title" className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent.icon}`}><LayoutDashboard className="h-5 w-5" aria-hidden="true" /></span>
                <h3 id="demo-panel-title" className="mt-4 text-lg font-bold">Painel do lojista</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">Faça login para conhecer as ferramentas de gestão da loja neste portal.</p>
                <button ref={panelButton} type="button" onClick={() => setShowPanel(true)} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
                  Fazer login no painel <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </section>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
