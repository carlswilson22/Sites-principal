import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import ModelCard from './components/ModelCard';
import Footer from './components/Footer';
import ModelHub from './components/ModelHub';
import { modelsList } from './data/modelsData';
import { findSelectedModel } from './data/modelNavigation';

export function App() {
  const [selected, setSelected] = useState(() => findSelectedModel(typeof window === 'undefined' ? '' : window.location.search, modelsList));
  const trigger = useRef(null);

  useEffect(() => {
    function handleHistory() {
      trigger.current = null;
      setSelected(findSelectedModel(window.location.search, modelsList));
    }
    window.addEventListener('popstate', handleHistory);
    return () => window.removeEventListener('popstate', handleHistory);
  }, []);

  function openModel(model, element) {
    trigger.current = element;
    setSelected(model);
  }

  function closeModel() {
    setSelected(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('modelo')) {
      url.searchParams.delete('modelo');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  return (
    <>
      <div id="portal-content" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
        <div className="relative z-10 flex-1 flex flex-col">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-14 sm:pb-20">
            <div className="model-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modelsList.map((model) => <ModelCard key={model.id} model={model} onOpen={openModel} />)}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      {selected && <ModelHub key={selected.id} model={selected} onClose={closeModel} returnFocus={trigger} />}
    </>
  );
}

export default App;
