import React from 'react';
import { StoreRequestForm } from '../components/common/StoreRequestForm';

export function StoreVisitPage({ dealership, storeKey, onNavigate }) {
  const address = dealership.endereco || {};
  const map = [address.logradouro, address.bairro, address.cidade, address.uf, address.cep].filter(Boolean).join(', ');
  return <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
    <div><h1 className="text-3xl font-bold text-white">Visitas e showroom</h1><p className="mt-2 text-slate-300">Conheça a {dealership.nome} e prepare sua visita.</p></div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-5 p-5 sm:p-7 rounded-2xl bg-slate-900 border border-slate-700">
        <h2 className="text-xl font-bold text-white">Onde estamos</h2><address className="not-italic text-slate-300 leading-relaxed">{map}</address>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(map)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-blue-300 underline">Abrir localização no mapa</a>
        <h2 className="text-xl font-bold text-white">Horários</h2><ul className="space-y-2 text-sm text-slate-300">{Object.entries(dealership.horarios || {}).map(([key, value]) => <li key={key}>{value}</li>)}</ul>
        <p className="text-sm text-slate-300">Telefone: <a href={`tel:${String(dealership.telefone || '').replace(/\D/g, '')}`} className="underline">{dealership.telefone}</a></p>
        <button type="button" onClick={() => onNavigate('sobre-contato')} className="min-h-11 text-blue-300 underline">Sobre a loja e contato</button>
      </div>
      <div className="space-y-5 p-5 sm:p-7 rounded-2xl bg-slate-900 border border-slate-700"><h2 className="text-xl font-bold text-white">Pedido de visita</h2><StoreRequestForm storeKey={storeKey} visit /></div>
    </div>
  </section>;
}
