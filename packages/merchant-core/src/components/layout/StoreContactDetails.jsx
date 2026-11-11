import React from 'react';
import { ChevronDown, Clock, MapPin, MessageCircle } from 'lucide-react';

const accents = { blue: 'text-blue-400', amber: 'text-amber-400', cyan: 'text-cyan-400' };

export function StoreContactDetails({ dealership, stacked = false, tone = 'blue', presentation = 'cards' }) {
  const address = dealership.endereco || {};
  const location = [address.logradouro, address.bairro, address.cidade, address.uf, address.cep].filter(Boolean).join(', ');
  const whatsapp = String(dealership.whatsapp || '').replace(/\D/g, '');
  const accent = accents[tone] || accents.blue;
  const groups = [
    { title: 'Plantão e WhatsApp', Icon: MessageCircle, content: <>
      {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={`block underline underline-offset-4 ${accent}`}>{dealership.whatsappFormatado || dealership.whatsapp}</a>}
      {dealership.telefone && <p>Telefone: <a href={`tel:${dealership.telefone.replace(/\D/g, '')}`} className="underline underline-offset-4">{dealership.telefone}</a></p>}
      {dealership.email && <a href={`mailto:${dealership.email}`} className="block break-all underline underline-offset-4">{dealership.email}</a>}
    </> },
    { title: 'Horários da loja', Icon: Clock, content: <>{Object.entries(dealership.horarios || {}).map(([key, value]) => <p key={key}>{value}</p>)}</> },
    { title: 'Endereço', Icon: MapPin, content: <>
      <address className="not-italic leading-relaxed">{address.logradouro}, {address.bairro}<br />{address.cidade}/{address.uf} · CEP {address.cep}</address>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className={`inline-block underline underline-offset-4 ${accent}`}>Abrir rota no Google Maps</a>
    </> },
  ];
  const directory = presentation === 'directory';
  const editorial = presentation === 'editorial';
  return <div aria-label="Informações de contato da loja" className={`grid ${editorial ? 'gap-8 lg:gap-12' : 'gap-5'} ${stacked || directory ? '' : 'md:grid-cols-3'}`}>
    {groups.map(({ title, Icon, content }, index) => directory ? <details key={title} open={index === 0} className="group rounded-2xl bg-slate-900/70 p-5 text-sm text-slate-300 min-w-0">
      <summary className="flex items-center gap-3 min-h-11 list-none cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 [&::-webkit-details-marker]:hidden"><Icon aria-hidden="true" className={`w-5 h-5 shrink-0 ${accent}`} /><span className="font-semibold text-white flex-1">{title}</span><ChevronDown aria-hidden="true" className="w-4 h-4 group-open:rotate-180" /></summary>
      <div className="space-y-3 pt-4">{content}</div>
    </details> : <section key={title} className={`${editorial ? '' : 'rounded-2xl bg-white/[0.03] p-5 sm:p-6'} min-w-0 space-y-3 text-sm text-slate-300`}>
      <Icon aria-hidden="true" className={`w-5 h-5 ${accent}`} /><h3 className={`font-heading text-lg text-white ${editorial ? 'font-medium' : 'font-bold'}`}>{title}</h3>{content}
    </section>)}
  </div>;
}
