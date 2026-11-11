import React from 'react';

export class StoreAppBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main role="alert" className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
      <div className="max-w-md space-y-5"><h1 className="text-2xl font-bold text-white">Não foi possível abrir esta página.</h1><p>Recarregue a loja para tentar novamente.</p><button type="button" onClick={() => window.location.reload()} className="min-h-12 rounded-xl px-5 bg-blue-600 text-white font-semibold">Recarregar loja</button><a href="../" className="block underline min-h-11 py-2">Voltar aos modelos</a></div>
    </main>;
  }
}
