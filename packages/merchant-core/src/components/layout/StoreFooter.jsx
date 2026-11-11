import React from 'react';

export function StoreFooter({ dealership, compact = false }) {
  const address = dealership.endereco || {};
  if (compact) return <footer className="text-slate-400 py-6">
    <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs">© {new Date().getFullYear()} {dealership.nome}. CNPJ: {dealership.cnpj}. Todos os direitos reservados.</p>
  </footer>;
  return <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="grid sm:grid-cols-3 gap-8 text-sm leading-relaxed">
        <div className="space-y-3"><p className="text-lg font-bold text-white">{dealership.nome}</p><p>Veículos selecionados e atendimento para ajudar em cada etapa da compra.</p><p>{dealership.telefone}</p><a href={`mailto:${dealership.email}`} className="break-all underline">{dealership.email}</a></div>
        <div className="space-y-3"><p className="font-semibold text-white">Endereço</p><address className="not-italic">{address.logradouro}, {address.bairro}<br />{address.cidade}/{address.uf} · {address.cep}</address></div>
        <div className="space-y-3"><p className="font-semibold text-white">Horários</p>{Object.entries(dealership.horarios || {}).map(([key, value]) => <p key={key}>{value}</p>)}</div>
      </div>
      <p className="border-t border-slate-800 pt-6 text-xs">© {new Date().getFullYear()} {dealership.nome}. CNPJ: {dealership.cnpj}. Todos os direitos reservados.</p>
    </div>
  </footer>;
}
