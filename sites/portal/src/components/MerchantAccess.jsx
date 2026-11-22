import React, { useRef, useState } from 'react';
import { LayoutDashboard, X } from 'lucide-react';

export function MerchantAccess({ models }) {
  const [selection, setSelection] = useState(null);
  const buttons = useRef({});

  function openPanel(model) {
    // A new key also lets the user return to the login if they leave it inside the frame.
    setSelection(previous => ({ model, revision: (previous?.revision || 0) + 1 }));
  }

  function closePanel() {
    const previousId = selection?.model.id;
    setSelection(null);
    buttons.current[previousId]?.focus();
  }

  return <section id="painel-do-lojista" aria-labelledby="merchant-access-title" className="mt-14 scroll-mt-6 sm:mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
    <div className="flex items-start gap-3">
      <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><LayoutDashboard aria-hidden="true" className="h-5 w-5" /></span>
      <div>
        <h2 id="merchant-access-title" className="text-xl sm:text-2xl font-bold text-slate-900">Painel do lojista</h2>
        <p className="mt-1 text-sm sm:text-base text-slate-600">Escolha um modelo para acessar o painel da loja aqui no portal.</p>
      </div>
    </div>
    <div role="group" aria-label="Escolha o painel do modelo" className="mt-6 flex flex-wrap gap-3">
      {models.filter(model => model.status === 'available').map(model => <button
        key={model.id}
        ref={element => { buttons.current[model.id] = element; }}
        type="button"
        aria-pressed={selection?.model.id === model.id}
        onClick={() => openPanel(model)}
        className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selection?.model.id === model.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:text-blue-700'}`}
      >{model.title}</button>)}
    </div>
    {selection && <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Painel: {selection.model.title}</p>
        <button type="button" onClick={closePanel} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
          <X aria-hidden="true" className="h-4 w-4" /> Fechar painel
        </button>
      </div>
      <iframe
        key={`${selection.model.id}-${selection.revision}`}
        title={`Painel do lojista: ${selection.model.title}`}
        src={`${import.meta.env.BASE_URL}${selection.model.path}#painel-lojista`}
        className="block h-[75vh] min-h-[36rem] w-full bg-white"
      />
    </div>}
  </section>;
}

export default MerchantAccess;
