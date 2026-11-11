import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { StoreConciergePage } from '../../pages/StoreConciergePage';
import { VehicleFinancingSection } from './VehicleFinancingSection';

export const VehicleAdServices = forwardRef(function VehicleAdServices({ vehicle, dealership, storeKey, initialFinancing = false }, ref) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequest, setChatRequest] = useState(0);
  const [financingRequest, setFinancingRequest] = useState(0);
  const chatRef = useRef(null);
  const financingRef = useRef(null);
  const id = useId();
  useImperativeHandle(ref, () => ({ openChat: () => { setChatOpen(true); setChatRequest(value => value + 1); } }), []);
  useEffect(() => {
    if (chatRequest > 0) {
      chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      chatRef.current?.querySelector('textarea')?.focus({ preventScroll: true });
    }
  }, [chatRequest]);
  useEffect(() => {
    if (initialFinancing || financingRequest > 0) financingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialFinancing, financingRequest]);
  return <div data-vehicle-services={vehicle.id} className="space-y-5">
    <section ref={chatRef} className="scroll-mt-4 rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden">
      <button type="button" onClick={() => setChatOpen(value => !value)} aria-expanded={chatOpen} aria-controls={id} className="w-full min-h-12 p-4 flex items-center gap-3 font-semibold text-white text-left hover:bg-slate-800"><MessageCircle aria-hidden="true" className="w-5 h-5 text-blue-300 shrink-0" /><span className="flex-1">Atendimento sobre este veículo</span><ChevronDown aria-hidden="true" className={`w-5 h-5 ${chatOpen ? 'rotate-180' : ''}`} /></button>
      <div id={id} hidden={!chatOpen} className="border-t border-slate-700 p-4 sm:p-5"><StoreConciergePage embedded vehicle={vehicle} dealership={dealership} storeKey={storeKey} onShowFinancing={() => setFinancingRequest(value => value + 1)} /></div>
    </section>
    <div ref={financingRef} className="scroll-mt-4"><VehicleFinancingSection vehicle={vehicle} dealership={dealership} storeKey={storeKey} initialOpen={initialFinancing} openRequest={financingRequest} /></div>
  </div>;
});
