import React, { useRef, useState } from 'react';
import { storeSync } from '../../services/storeSync';

const field = 'mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900';
const localDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function BookingForm({ storeKey, vehicles = [], vehicle: fixedVehicle, initialType = 'visita' }) {
  const [kind, setKind] = useState(initialType);
  const [date, setDate] = useState(localDay(new Date()));
  const [time, setTime] = useState('');
  const [vehicleId, setVehicleId] = useState(String(fixedVehicle?.id || ''));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const times = Array.from({ length: 16 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
  const submit = async event => {
    event.preventDefault();
    if (lock.current) return;
    const when = new Date(`${date}T${time}:00`);
    if (!time || Number.isNaN(when.getTime()) || when <= new Date()) return setMessage('Escolha uma data e um horário futuros.');
    if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15 || !consent) return setMessage('Informe nome, WhatsApp com DDD e autorize o contato.');
    const vehicle = fixedVehicle || vehicles.find(item => String(item.id) === vehicleId);
    lock.current = true; setBusy(true); setMessage('');
    try {
      await storeSync.addLead(storeKey, { name: name.trim(), phone: phone.trim(), consent: true, source: 'formulario_site', vehicle_id: vehicle?.id,
        vehicle_title: vehicle?.nome || vehicle?.title, message: `Solicitação de ${kind === 'visita' ? 'visita' : 'test drive'} para ${when.toLocaleString('pt-BR')}.`,
        simulation_data: { booking: { type: kind, starts_at: when.toISOString() } } });
      setMessage('Solicitação registrada. A loja precisa confirmar o horário.');
      setName(''); setPhone(''); setConsent(false);
    } catch (error) { setMessage(error.message || 'Não foi possível registrar a solicitação. Tente novamente.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <form data-booking-form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-6">
    <fieldset><legend className="mb-2 font-semibold">Como você quer conhecer a loja?</legend><div className="flex flex-wrap gap-2">
      {[['visita', 'Agendar visita'], ['test_drive', 'Test drive']].map(([value, label]) => <button key={value} type="button" onClick={() => setKind(value)} aria-pressed={kind === value} style={kind === value ? { backgroundColor: 'var(--store-action)', color: '#fff' } : undefined} className={`min-h-11 rounded-xl px-4 font-semibold ${kind === value ? 'bg-blue-700 text-white' : 'border border-slate-300 text-slate-700'}`}>{label}</button>)}
    </div></fieldset>
    {!fixedVehicle && <label className="block text-sm font-medium">Veículo de interesse (opcional)<select className={field} value={vehicleId} onChange={event => setVehicleId(event.target.value)}><option value="">Escolher depois</option>{vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.nome || vehicle.title}</option>)}</select></label>}
    {fixedVehicle && <p className="text-sm text-slate-600">Veículo: <strong>{fixedVehicle.nome || fixedVehicle.title}</strong></p>}
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Data<input className={field} type="date" required min={localDay(new Date())} value={date} onChange={event => setDate(event.target.value)} /></label><label className="text-sm font-medium">Horário<select className={field} required value={time} onChange={event => setTime(event.target.value)}><option value="">Escolha um horário</option>{times.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
    <p className="text-xs text-slate-600">Horário desejado, sujeito à confirmação da loja. Os horários apresentados são ilustrativos.</p>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Nome<input className={field} required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label><label className="text-sm font-medium">WhatsApp com DDD<input className={field} required type="tel" maxLength={20} autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label></div>
    <label className="flex gap-2 text-sm"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} />Autorizo a loja a entrar em contato sobre a solicitação.</label>
    {message && <p role="status" className="text-sm font-medium text-blue-800">{message}</p>}
    <button disabled={busy} style={{ backgroundColor: 'var(--store-action)', color: '#fff' }} className="min-h-11 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Enviando…' : 'Solicitar horário'}</button>
    {!storeSync.isRemote && <p className="text-xs text-slate-600">Demonstração: a solicitação fica somente neste navegador e aparece no painel deste dispositivo.</p>}
  </form>;
}

export function BookingPage({ storeKey, dealership, vehicles }) {
  return <div className="bg-slate-50 px-4 py-10 sm:py-16"><div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2"><div><p className="text-sm font-semibold text-blue-700">{dealership.nome}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Escolha seu melhor horário</h1><p className="mt-3 text-slate-600">Solicite uma visita ou um test drive. Nossa equipe confirma os detalhes com você.</p></div><BookingForm storeKey={storeKey} vehicles={vehicles} /></div></div>;
}
