import React from 'react';
import { Clock, MapPin, MessageCircle } from 'lucide-react';

const accents = { blue: 'text-blue-400', amber: 'text-amber-400', cyan: 'text-cyan-400' };

export function StoreContactDetails({ dealership, stacked = false, tone = 'blue' }) {
  const address = dealership.endereco || {};
  const location = [address.logradouro, address.bairro, address.cidade, address.uf, address.cep].filter(Boolean).join(', ');
  const whatsapp = String(dealership.whatsapp || '').replace(/\D/g, '');
  const accent = accents[tone] || accents.blue;
  const cardClass = 'rounded-2xl bg-white/[0.03] p-5 sm:p-6 space-y-3 text-sm text-slate-300';
  return <div aria-label="Informações de contato da loja" className={`grid gap-5 ${stacked ? '' : 'md:grid-cols-3'}`}>
    <section className={cardClass}>
      <MessageCircle aria-hidden="true" className={`w-5 h-5 ${accent}`} />
      <h3 className="font-heading font-bold text-lg text-white">Plantão e WhatsApp</h3>
      {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={`block underline underline-offset-4 ${accent}`}>{dealership.whatsappFormatado || dealership.whatsapp}</a>}
      {dealership.telefone && <p>Telefone: <a href={`tel:${dealership.telefone.replace(/\D/g, '')}`} className="underline underline-offset-4">{dealership.telefone}</a></p>}
      {dealership.email && <a href={`mailto:${dealership.email}`} className="block break-all underline underline-offset-4">{dealership.email}</a>}
    </section>
    <section className={cardClass}>
      <Clock aria-hidden="true" className={`w-5 h-5 ${accent}`} />
      <h3 className="font-heading font-bold text-lg text-white">Horários da loja</h3>
      {Object.entries(dealership.horarios || {}).map(([key, value]) => <p key={key}>{value}</p>)}
    </section>
    <section className={cardClass}>
      <MapPin aria-hidden="true" className={`w-5 h-5 ${accent}`} />
      <h3 className="font-heading font-bold text-lg text-white">Endereço</h3>
      <address className="not-italic leading-relaxed">{address.logradouro}, {address.bairro}<br />{address.cidade}/{address.uf} · CEP {address.cep}</address>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className={`inline-block underline underline-offset-4 ${accent}`}>Abrir rota no Google Maps</a>
    </section>
  </div>;
}
