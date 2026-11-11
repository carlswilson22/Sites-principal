import React from 'react';

export function ModelPreview({ model }) {
  const photo = <img src={import.meta.env.BASE_URL + model.previewImage} alt="" loading="lazy" width={640} height={360} className="w-full h-full object-cover" />;
  return <div aria-hidden="true" className="h-full p-4 pt-14 bg-slate-100">
    <div className="h-full flex flex-col rounded-lg overflow-hidden bg-slate-950 shadow-lg">
      {model.presentation === 'editorial' ? <>
        <div className="h-6 flex items-center justify-center bg-black"><span className="text-[8px] tracking-[0.2em] text-amber-100">DRIVENOW</span></div>
        <div className="min-h-0 flex-1 relative">{photo}<div className="absolute inset-0 bg-black/45 flex items-center px-4 text-lg text-white font-light leading-tight">Algumas escolhas<br />merecem tempo.</div></div>
        <div className="p-3 flex items-center gap-3"><span className="text-amber-200/70 text-xs">01</span><div className="h-1.5 w-16 bg-slate-600" /><div className="h-1 w-10 bg-amber-100 ml-auto" /></div>
      </> : model.presentation === 'explorer' ? <>
        <div className="h-6 bg-slate-900 flex items-center px-3"><span className="text-[8px] tracking-wider text-cyan-200">ENTERPRISE</span><span className="h-2 w-10 bg-cyan-300/30 rounded ml-auto" /></div>
        <div className="min-h-0 flex-1 relative">{photo}<span className="absolute bottom-2 left-3 text-[8px] text-white bg-black/60 px-1.5 py-0.5 rounded">Novos caminhos. Uma escolha sua.</span></div>
        <div className="bg-[#10292e] px-3 py-2 flex items-center justify-between gap-3"><p className="text-white text-[9px] leading-snug">Sua escolha.<br /><span className="text-cyan-200">Por uma nova perspectiva.</span></p><div className="shrink-0 space-y-1"><div className="h-2 w-12 bg-cyan-200 rounded-sm" /><div className="grid grid-cols-2 gap-1"><span className="h-2 border border-cyan-200/30 rounded-sm" /><span className="h-2 border border-cyan-200/30 rounded-sm" /></div></div></div>
        <div className="px-3 py-2 space-y-1.5"><div className="h-3 rounded border border-slate-600 bg-slate-900" /><div className="grid grid-cols-2 gap-2"><div className="h-4 rounded bg-slate-800" /><div className="h-4 rounded bg-slate-800" /></div></div>
      </> : <>
        <div className="h-6 bg-slate-900 flex items-center px-3"><span className="text-[8px] tracking-wider text-blue-200">AUTOELITE</span><span className="h-1 w-12 bg-slate-600 ml-auto" /></div>
        <div className="p-3 grid grid-cols-2 gap-3"><div className="space-y-3"><p className="text-white text-xs font-bold leading-snug">Seu próximo carro.<br /><span className="text-blue-300">Do seu jeito.</span></p><div className="h-5 rounded bg-white/10 border border-slate-600 flex justify-end p-1"><span className="w-6 bg-blue-500 rounded-sm" /></div></div><div className="h-20 rounded-lg overflow-hidden">{photo}</div></div>
        <div className="px-3 pb-3 grid grid-cols-3 gap-2">{[1,2,3].map(item => <div key={item} className="h-6 rounded bg-slate-800 border-t-2 border-blue-500/40" />)}</div>
      </>}
    </div>
  </div>;
}
