import React from 'react';
import Header from './components/Header';
import ModelCard from './components/ModelCard';
import Footer from './components/Footer';
import { modelsList } from './data/modelsData';

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
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
