import React, { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { VehicleFinancingSection } from './VehicleFinancingSection';
import { useVehicleAdSection } from './VehicleAdSections';

const StoreConciergePage = lazy(() => import('../../pages/StoreConciergePage').then(module => ({ default: module.StoreConciergePage })));

export function VehicleAdServices({ vehicle, dealership, storeKey, initialFinancing = false }) {
  const [activeService, setActiveService] = useVehicleAdSection('service');
  const chatOpen = activeService === 'chat';
  const [chatMounted, setChatMounted] = useState(false);
  const [financingRequest, setFinancingRequest] = useState(0);
  const chatRef = useRef(null);
  const financingRef = useRef(null);
  const id = useId();
  const focusChat = useCallback(() => { if (chatOpen) chatRef.current?.querySelector('textarea')?.focus({ preventScroll: true }); }, [chatOpen]);
  useEffect(() => {
    if (initialFinancing || financingRequest > 0) financingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialFinancing, financingRequest]);
  return <div data-vehicle-services={vehicle.id} className="space-y-2">
    <section ref={chatRef} className="scroll-mt-4 rounded-xl border border-slate-700 bg-slate-950/40 overflow-hidden">
      <button type="button" data-ad-service="chat" onClick={() => { setChatMounted(true); setActiveService(value => value === 'chat' ? null : 'chat'); }} aria-expanded={chatOpen} aria-controls={id} className="w-full min-h-11 px-3 py-2.5 flex items-center gap-3 text-sm font-semibold text-white text-left hover:bg-slate-800"><MessageCircle aria-hidden="true" className="w-4 h-4 text-blue-300 shrink-0" /><span className="flex-1">Atendimento sobre este veículo</span><ChevronDown aria-hidden="true" className={`w-4 h-4 ${chatOpen ? 'rotate-180' : ''}`} /></button>
      <div id={id} hidden={!chatOpen} className="border-t border-slate-700 p-4 sm:p-5">{chatMounted && <Suspense fallback={<p role="status" className="text-sm text-slate-300">Carregando atendimento…</p>}><StoreConciergePage embedded vehicle={vehicle} dealership={dealership} storeKey={storeKey} onReady={focusChat} onShowFinancing={() => setFinancingRequest(value => value + 1)} /></Suspense>}</div>
    </section>
    <div ref={financingRef} className="scroll-mt-4"><VehicleFinancingSection vehicle={vehicle} dealership={dealership} storeKey={storeKey} initialOpen={initialFinancing} openRequest={financingRequest} /></div>
  </div>;
}
