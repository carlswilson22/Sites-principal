import React from 'react';

export function VehicleAdFacts({ items }) {
  return <dl data-ad-facts className="divide-y divide-slate-700/60 text-sm">
    {items.map(([label, value]) => <div key={label} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1.5">
      <dt className="text-slate-400">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-white">{value ?? 'Não informado'}</dd>
    </div>)}
  </dl>;
}

export function VehicleEquipmentList({ vehicle }) {
  return vehicle.opcionais?.length ? <ul className="divide-y divide-slate-700/60 text-sm text-slate-200">
    {vehicle.opcionais.map((item, index) => <li key={`${item}-${index}`} className="py-2">{item}</li>)}
  </ul> : <p className="text-sm text-slate-400">Equipamentos não informados.</p>;
}

export function VehicleTechnicalSheet({ vehicle }) {
  const fields = { motor: vehicle.motor, potencia: vehicle.potencia, aceleracao: vehicle.aceleracao,
    ...(typeof vehicle.blindado === 'boolean' ? { blindagem: vehicle.blindado ? 'Sim' : 'Não' } : {}),
    ...vehicle.fichaTecnica };
  return <VehicleAdFacts items={Object.entries(fields).filter(([, value]) => value != null && value !== '').map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase()), value])} />;
}

export function VehicleInspectionDetails({ vehicle, onOpenDossier }) {
  const report = vehicle.laudoCautelar || {};
  return <div className="space-y-3">
    <p className="text-sm text-slate-300">Status: <strong className="text-white">{report.status || 'Não informado'}</strong></p>
    <p className="text-xs text-slate-400">Informações fornecidas pela loja. Confirme a documentação com a equipe.</p>
    <VehicleAdFacts items={[
      ['Código do laudo', report.codigoLaudo], ['Responsável', report.perito],
      ['Estrutura e chassi', report.estrutura], ['Pintura', report.pintura],
      ['Mecânica', report.mecanica], ['Histórico de sinistro e leilão', report.sinistroLeilao],
    ].filter(([, value]) => value != null && value !== '')} />
    {onOpenDossier && <button type="button" onClick={() => onOpenDossier(vehicle)} className="min-h-11 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20">Abrir dossiê do veículo</button>}
  </div>;
}
