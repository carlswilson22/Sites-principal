import React from 'react';
import { ArrowRight, Calculator, ArrowLeftRight, CalendarDays, Bot } from 'lucide-react';

export function StoreServicesPage({ onNavigate, premium = false }) {
  const groups = [{
    title: 'Compra e negociação',
    items: [
      { id: 'simulador', title: 'Financiamento', description: 'Escolha um veículo e consulte uma estimativa de entrada e parcelas.', icon: Calculator },
      { id: 'troca', title: 'Avaliação de troca', description: 'Informe os dados do seu veículo para conversar com a equipe sobre a troca.', icon: ArrowLeftRight },
      premium
        ? { id: 'concierge', title: 'Atendimento e visita', description: 'Conheça as opções de atendimento e agende uma visita à loja.', icon: CalendarDays }
        : { id: 'consultor-ia', title: 'Consultor virtual', description: 'Explore os veículos de acordo com o que você procura.', icon: Bot },
    ],
  }];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
    <div className="max-w-2xl space-y-3">
      <h1 className="text-3xl sm:text-4xl font-bold text-white">Serviços da loja</h1>
      <p className="text-base text-slate-300">Escolha o próximo passo para encontrar seu veículo e conversar com a nossa equipe.</p>
    </div>
    {groups.map(group => <section key={group.title} className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{group.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.map(({ id, title, description, icon: Icon }) => <button key={id} type="button" onClick={() => onNavigate(id)}
          className={`text-left p-6 rounded-2xl border bg-slate-900/80 flex flex-col gap-4 min-h-56 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${premium ? 'border-amber-500/25 hover:border-amber-400 focus-visible:outline-amber-400' : 'border-slate-700 hover:border-cyan-400 focus-visible:outline-cyan-400'}`}>
          <Icon aria-hidden="true" className={`w-6 h-6 ${premium ? 'text-amber-300' : 'text-cyan-300'}`} />
          <span className="text-lg font-bold text-white">{title}</span>
          <span className="text-sm leading-relaxed text-slate-300">{description}</span>
          <span className={`mt-auto flex items-center gap-2 text-sm font-semibold ${premium ? 'text-amber-300' : 'text-cyan-300'}`}>Acessar <ArrowRight aria-hidden="true" className="w-4 h-4" /></span>
        </button>)}
      </div>
    </section>)}
  </div>;
}
