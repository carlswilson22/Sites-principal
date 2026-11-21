import React, { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { VehicleFinancingSection } from './VehicleFinancingSection';
import { BookingForm } from './BookingForm';
import { useVehicleAdSection } from './VehicleAdSections';
import { useDisclosurePresence } from './useDisclosurePresence';

const StoreConciergePage = lazy(() => import('../../pages/StoreConciergePage').then(module => ({ default: module.StoreConciergePage })));

export function VehicleAdServices({ vehicle, dealership, storeKey, initialFinancing = false }) {
  const [activeService, setActiveService] = useVehicleAdSection('service');
  const chatOpen = activeService === 'chat';
  const [chatMounted, setChatMounted] = useState(false);
  const [bookingType, setBookingType] = useState(null);
  const chatPresent = useDisclosurePresence(chatOpen);
  const bookingPresent = useDisclosurePresence(Boolean(bookingType));
  const lastBookingType = useRef(null);
  if (bookingType) lastBookingType.current = bookingType;
  const [financingRequest, setFinancingRequest] = useState(0);
  const chatRef = useRef(null);
  const financingRef = useRef(null);
  const id = useId();
  const focusChat = useCallback(() => { if (chatOpen) chatRef.current?.querySelector('textarea')?.focus({ preventScroll: true }); }, [chatOpen]);
  useEffect(() => {
    if (initialFinancing || financingRequest > 0) financingRef.current?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }, [initialFinancing, financingRequest]);
  return <div data-vehicle-services={vehicle.id} className="space-y-2">
    <section ref={chatRef} className="scroll-mt-4 rounded-xl border border-slate-700 bg-slate-950/40 overflow-hidden">
      <button type="button" data-ad-service="chat" onClick={() => { setChatMounted(true); setActiveService(value => value === 'chat' ? null : 'chat'); }} aria-expanded={chatOpen} aria-controls={id} className="w-full min-h-11 px-3 py-2.5 flex items-center gap-3 text-sm font-semibold text-white text-left hover:bg-slate-800"><MessageCircle aria-hidden="true" className="w-4 h-4 text-blue-300 shrink-0" /><span className="flex-1">Atendimento sobre este veículo</span><ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform ${chatOpen ? 'rotate-180' : ''}`} /></button>
      <div id={id} data-store-disclosure data-open={chatOpen} hidden={!chatPresent} aria-hidden={!chatOpen} inert={chatOpen ? undefined : ''}><div className="border-t border-slate-700 p-4 sm:p-5">{chatMounted && <Suspense fallback={<p role="status" className="text-sm text-slate-300">Carregando atendimento…</p>}><StoreConciergePage embedded vehicle={vehicle} dealership={dealership} storeKey={storeKey} onReady={focusChat} onShowFinancing={() => setFinancingRequest(value => value + 1)} /></Suspense>}</div></div>
    </section>
    <div className="grid grid-cols-2 gap-2">{[['visita', 'Agendar visita'], ['test_drive', 'Test drive']].map(([type, label]) => <button key={type} type="button" aria-expanded={bookingType === type} onClick={() => setBookingType(value => value === type ? null : type)} className="min-h-11 rounded-xl border border-blue-400 px-3 py-2 text-sm font-semibold text-blue-200">{label}</button>)}</div>
    <div data-store-disclosure data-open={Boolean(bookingType)} hidden={!bookingPresent} aria-hidden={!bookingType} inert={bookingType ? undefined : ''}>{bookingPresent && <div><BookingForm key={lastBookingType.current} storeKey={storeKey} vehicle={vehicle} initialType={lastBookingType.current} /></div>}</div>
    <div ref={financingRef} className="scroll-mt-4"><VehicleFinancingSection vehicle={vehicle} dealership={dealership} storeKey={storeKey} initialOpen={initialFinancing} openRequest={financingRequest} /></div>
  </div>;
}
