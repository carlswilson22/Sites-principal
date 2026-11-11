import React, { forwardRef, lazy, Suspense, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { VehicleFinancingSection } from './VehicleFinancingSection';

const StoreConciergePage = lazy(() => import('../../pages/StoreConciergePage').then(module => ({ default: module.StoreConciergePage })));

export const VehicleAdServices = forwardRef(function VehicleAdServices({ vehicle, dealership, storeKey, initialFinancing = false }, ref) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [chatRequest, setChatRequest] = useState(0);
  const [financingRequest, setFinancingRequest] = useState(0);
  const chatRef = useRef(null);
  const financingRef = useRef(null);
  const id = useId();
  const focusChat = useCallback(() => chatRef.current?.querySelector('textarea')?.focus({ preventScroll: true }), []);
  useImperativeHandle(ref, () => ({ openChat: () => { setChatMounted(true); setChatOpen(true); setChatRequest(value => value + 1); } }), []);
  useEffect(() => {
    if (chatRequest > 0) {
      chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      focusChat();
    }
  }, [chatRequest, focusChat]);
  useEffect(() => {
    if (initialFinancing || financingRequest > 0) financingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialFinancing, financingRequest]);
  return <div data-vehicle-services={vehicle.id} className="space-y-5">
    <section ref={chatRef} className="scroll-mt-4 rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden">
      <button type="button" onClick={() => { setChatMounted(true); setChatOpen(value => !value); }} aria-expanded={chatOpen} aria-controls={id} className="w-full min-h-12 p-4 flex items-center gap-3 font-semibold text-white text-left hover:bg-slate-800"><MessageCircle aria-hidden="true" className="w-5 h-5 text-blue-300 shrink-0" /><span className="flex-1">Atendimento sobre este veículo</span><ChevronDown aria-hidden="true" className={`w-5 h-5 ${chatOpen ? 'rotate-180' : ''}`} /></button>
      <div id={id} hidden={!chatOpen} className="border-t border-slate-700 p-4 sm:p-5">{chatMounted && <Suspense fallback={<p role="status" className="text-sm text-slate-300">Carregando atendimento…</p>}><StoreConciergePage embedded vehicle={vehicle} dealership={dealership} storeKey={storeKey} onReady={focusChat} onShowFinancing={() => setFinancingRequest(value => value + 1)} /></Suspense>}</div>
    </section>
    <div ref={financingRef} className="scroll-mt-4"><VehicleFinancingSection vehicle={vehicle} dealership={dealership} storeKey={storeKey} initialOpen={initialFinancing} openRequest={financingRequest} /></div>
  </div>;
});
