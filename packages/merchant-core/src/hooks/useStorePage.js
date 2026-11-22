import { useCallback, useEffect, useState } from 'react';

const STAFF_HASH = '#painel-lojista';

// O endereço reservado abre o formulário da equipe; não concede acesso ao painel.
export function useStorePage() {
  const [page, setPage] = useState(() => typeof window !== 'undefined' && window.location.hash === STAFF_HASH ? 'painel-lojista' : 'home');
  useEffect(() => {
    const sync = () => setPage(previous => window.location.hash === STAFF_HASH ? 'painel-lojista' : previous === 'painel-lojista' ? 'home' : previous);
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const navigate = useCallback(next => {
    if (typeof window !== 'undefined') {
      const base = `${window.location.pathname}${window.location.search}`;
      if (next === 'painel-lojista' && window.location.hash !== STAFF_HASH) {
        window.history.pushState(window.history.state, '', `${base}${STAFF_HASH}`);
      } else if (next !== 'painel-lojista' && window.location.hash === STAFF_HASH) {
        window.history.replaceState(window.history.state, '', base);
      }
    }
    setPage(next);
  }, []);
  return [page, navigate];
}
