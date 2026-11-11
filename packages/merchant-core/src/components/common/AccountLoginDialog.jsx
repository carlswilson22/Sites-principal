import React, { useId, useState } from 'react';
import { X } from 'lucide-react';
import { useDialog } from './useDialog';
import { AccountLoginForm } from './AccountLoginForm';

export function AccountLoginDialog({ audience, reason, storeName, onClose, onSuccess }) {
  const dialogRef = useDialog(onClose);
  const id = useId();
  const [selected, setSelected] = useState(audience);
  return <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[80] bg-black/80 p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
    <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7 text-white shadow-2xl space-y-5">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-blue-200 mb-2">{storeName}</p><h2 id={id} className="text-2xl font-bold">{selected === 'staff' ? 'Acesso da equipe' : 'Entre para continuar'}</h2></div><button type="button" aria-label="Fechar login" onClick={onClose} className="min-w-11 min-h-11 rounded-lg hover:bg-slate-800 flex items-center justify-center"><X aria-hidden="true" className="w-5 h-5" /></button></div>
      <p className="text-sm text-slate-300">{selected === 'staff' ? 'O painel de gestão é exclusivo dos funcionários da loja.' : reason || 'Acesse sua conta para usar as ferramentas pessoais da loja.'}</p>
      <div className="grid grid-cols-2 gap-2" aria-label="Tipo de acesso">
        <button type="button" aria-pressed={selected === 'customer'} onClick={() => setSelected('customer')} className={`min-h-11 rounded-xl text-sm font-semibold ${selected === 'customer' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Cliente</button>
        <button type="button" aria-pressed={selected === 'staff'} onClick={() => setSelected('staff')} className={`min-h-11 rounded-xl text-sm font-semibold ${selected === 'staff' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Equipe da loja</button>
      </div>
      <AccountLoginForm key={selected} audience={selected} onSuccess={onSuccess} />
      <button type="button" onClick={onClose} className="min-h-11 w-full text-sm text-slate-300 hover:text-white">Continuar como visitante</button>
    </div>
  </div>;
}
