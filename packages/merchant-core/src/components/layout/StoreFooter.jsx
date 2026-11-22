import React from 'react';

export function StoreFooter({ dealership }) {
  return <footer className="border-t border-slate-800 bg-slate-950 py-6 text-slate-400">
    <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs">
      © {new Date().getFullYear()} {dealership.nome}. Todos os direitos reservados.{' '}
      <a className="underline" href="https://github.com/carlswilson22/Sites-principal/blob/main/NOTICE">Créditos das mídias</a>
    </p>
  </footer>;
}
