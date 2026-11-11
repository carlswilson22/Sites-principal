import React from 'react';
import Header from './components/Header';
import ModelCard from './components/ModelCard';
import Footer from './components/Footer';
import { modelsList, aLaCarteTools } from './data/modelsData';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero & Intro Section */}
        <Header />

        {/* Models Grid Showcase */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-14 sm:pb-20">
          <div className="model-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modelsList.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
          <section aria-labelledby="a-la-carte-title" className="mt-14 sm:mt-20 space-y-5">
            <div><h2 id="a-la-carte-title" className="text-2xl sm:text-3xl font-bold">Ferramentas à la carte</h2><p className="mt-2 text-slate-600">Adicione recursos conforme as necessidades da sua loja.</p></div>
            <ul className="space-y-4">{aLaCarteTools.map(tool => <li key={tool.id} className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 space-y-2"><h3 className="text-lg font-semibold">{tool.title}</h3><p className="text-slate-600 max-w-3xl">{tool.description}</p><p className="text-sm font-semibold text-blue-700">{tool.included}</p></li>)}</ul>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
