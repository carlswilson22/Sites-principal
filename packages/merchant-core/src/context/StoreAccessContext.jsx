import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { storeSync } from '../services/storeSync';
import { isRemote } from '../services/remote';

const StoreAccessContext = createContext(null);

export function StoreAccessProvider({ storeKey, storeName, children }) {
  return <AuthProvider storeKey={storeKey}><StoreAccess storeKey={storeKey} storeName={storeName}>{children}</StoreAccess></AuthProvider>;
}

function StoreAccess({ storeKey, storeName, children }) {
  const auth = useAuth();
  const [storeError, setStoreError] = useState('');
  useEffect(() => {
    if (!isRemote) return undefined;
    const off = storeSync.subscribe(storeKey, detail => { if (detail.type === 'STORE_ERROR') setStoreError(detail.message); });
    storeSync.hydrate(storeKey, { force: true }).then(() => setStoreError('')).catch(() => {});
    return off;
  }, [storeKey, auth.user?.id, auth.user?.role]);
  // A entrada no painel verifica a sessão da equipe. As páginas públicas não exigem conta.
  const authorizeNavigation = (_page, action) => action(auth.user);
  return <StoreAccessContext.Provider value={{ ...auth, storeKey, storeName, storeError, authorizeNavigation }}>
    {children}
  </StoreAccessContext.Provider>;
}

export function useStoreAccess() {
  const context = useContext(StoreAccessContext);
  if (!context) throw new Error('O acesso do site precisa de StoreAccessProvider.');
  return context;
}
