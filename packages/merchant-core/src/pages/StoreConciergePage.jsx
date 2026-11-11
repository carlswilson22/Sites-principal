import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { conciergeReply } from '../utils/concierge';
import { StoreRequestForm } from '../components/common/StoreRequestForm';
import { VehicleImage } from '../components/common/VehicleImage';

const money = amount => Number(amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function StoreConciergePage({ dealership, storeKey, vehicles = [], onSelectVehicle, onNavigate, title = 'Atendimento no site', embedded = false, vehicle = null, onShowFinancing, onReady }) {
  const storageKey = `concierge_chat_${storeKey}${vehicle ? `:vehicle:${vehicle.id}` : ''}`;
  const Heading = embedded ? 'h3' : 'h1';
  const [messages, setMessages] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
      return Array.isArray(stored) ? stored.filter(item => ['user', 'assistant'].includes(item.role) && typeof item.text === 'string').slice(-40) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [request, setRequest] = useState(null);
  const historyRef = useRef(null);
  useEffect(() => { onReady?.(); }, [onReady]);
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-40))); } catch { /* A conversa continua em memória. */ }
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [messages, storageKey]);
  const send = text => {
    if (!text.trim()) return;
    const reply = conciergeReply(text, vehicles, dealership, vehicle);
    setMessages(current => [...current, { role: 'user', text: text.trim() }, { role: 'assistant', ...reply }].slice(-40));
    setInput('');
  };
  const whatsapp = String(dealership.whatsapp || '').replace(/\D/g, '');
  const handoff = `Olá, gostaria de falar com um funcionário da ${dealership.nome}.${vehicle ? ` Tenho interesse no ${vehicle.nome || vehicle.title} (anúncio ${vehicle.id}), por ${money(vehicle.preco ?? vehicle.price)}.` : ''}\n${messages.filter(message => message.role === 'user').slice(-5).map(message => message.text).join('\n').slice(0, 1800)}`;
  return <section data-concierge-vehicle={vehicle?.id} className={embedded ? 'space-y-4' : 'max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6'}>
    <div><Heading className={`${embedded ? 'text-lg' : 'text-3xl'} font-bold text-white`}>{embedded ? `Vamos conversar sobre o ${vehicle?.nome || vehicle?.title}` : title}</Heading><p className="mt-2 text-sm text-slate-300">{embedded ? `Assistente automático da ${dealership.nome}. Tire dúvidas e consulte o financiamento sem sair deste anúncio.` : `Assistente automático da ${dealership.nome}. Consulte o estoque e tire suas dúvidas aqui.`}</p></div>
    <div className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      <div ref={historyRef} role="log" aria-label="Conversa com o concierge" aria-live="polite" aria-relevant="additions" className={`${embedded ? 'h-64' : 'h-[min(60vh,32rem)] min-h-64'} overflow-y-auto p-4 sm:p-6 space-y-5`}>
        <div className="max-w-xl rounded-2xl p-4 bg-slate-800 text-slate-200 text-sm"><strong className="block text-white mb-1">Assistente da loja</strong>{vehicle ? `Olá! Você está no anúncio do ${vehicle.nome || vehicle.title}. Quer saber mais sobre o veículo, simular parcelas ou falar com a equipe?` : 'Olá! Como posso ajudar? Informe um modelo, seu orçamento ou o tipo de carro que procura.'}</div>
        {messages.map((message, index) => <div key={index} className={`max-w-xl rounded-2xl p-4 text-sm space-y-3 ${message.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
          <strong className="block">{message.role === 'user' ? 'Você' : 'Assistente da loja'}</strong><p className="whitespace-pre-line break-words">{message.text}</p>
          {!embedded && message.role === 'assistant' && (Array.isArray(message.vehicleIds) ? message.vehicleIds : []).map(vehicleId => {
            const vehicle = vehicles.find(item => String(item.id) === String(vehicleId));
            return vehicle && <button key={vehicleId} type="button" onClick={() => onSelectVehicle(vehicle)} className="flex items-center gap-3 w-full p-3 text-left rounded-xl border border-slate-600 hover:border-blue-300"><VehicleImage src={vehicle.imagemPrincipal} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" /><span>{vehicle.nome}<span className="block text-blue-200">{money(vehicle.preco)}</span></span></button>;
          })}
          {message.action === 'visit' && whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(handoff)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center underline text-white min-h-11">Combinar visita com o lojista no WhatsApp</a>}
          {!embedded && message.action === 'inventory' && <button type="button" onClick={() => onNavigate('estoque')} className="underline text-white min-h-11">Ver estoque</button>}
          {embedded && message.action === 'financing' && <button type="button" onClick={onShowFinancing} className="underline text-white min-h-11">Abrir simulador neste anúncio</button>}
          {message.action === 'request' && <button type="button" onClick={() => setRequest('preference')} className="underline text-white min-h-11">Registrar minha preferência</button>}
        </div>)}
      </div>
      <div className="px-4 sm:px-6 py-3 border-t border-slate-700 flex flex-wrap gap-2">
        {(embedded ? ['Detalhes do veículo', 'Visitar a loja', 'Consultar o laudo', 'Simular financiamento'] : ['Encontrar um veículo', 'Visitar a loja', 'Endereço e horários', 'Como simular financiamento?']).map(text => <button key={text} type="button" onClick={() => send(text)} className="min-h-10 px-3 py-2 rounded-lg border border-slate-600 text-xs text-slate-200 hover:bg-slate-800">{text}</button>)}
      </div>
      <form onSubmit={event => { event.preventDefault(); send(input); }} className="p-4 sm:p-6 flex items-end gap-2">
        <label className="flex-1 text-sm text-slate-300">Sua mensagem<textarea maxLength={1200} rows={2} value={input} onChange={event => setInput(event.target.value)} className="mt-1 w-full p-3 bg-slate-950 border border-slate-600 rounded-xl text-white" placeholder={embedded ? 'O que você gostaria de saber sobre este veículo?' : 'Ex.: SUV automático até 150 mil'} /></label>
        <button type="submit" disabled={!input.trim()} aria-label="Enviar mensagem" className="min-h-12 min-w-12 flex justify-center items-center rounded-xl bg-blue-600 text-white disabled:opacity-40"><Send aria-hidden="true" className="w-5 h-5" /></button>
      </form>
    </div>
    <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setRequest(value => value ? null : 'preference')} aria-expanded={Boolean(request)} className="min-h-11 px-4 py-3 rounded-xl border border-slate-600 text-white">Registrar preferência</button>{whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(handoff)}`} target="_blank" rel="noopener noreferrer" className="min-h-11 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" />Falar com a equipe no WhatsApp</a>}</div>
    {request && <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900"><StoreRequestForm storeKey={storeKey} vehicle={vehicle} context={messages.filter(message => message.role === 'user').slice(-5).map(message => message.text).join('\n')} /></div>}
  </section>;
}
