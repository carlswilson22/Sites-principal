import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AccountLoginDialog } from '../components/common/AccountLoginDialog';
import { customerPages } from '../utils/siteAccess';
import { isStaffUser } from '../services/demoConfig';
import { storeSync } from '../services/storeSync';

const StoreAccessContext = createContext(null);

export function StoreAccessProvider({ storeKey, storeName, children }) {
  return <AuthProvider storeKey={storeKey}><StoreAccess storeKey={storeKey} storeName={storeName}>{children}</StoreAccess></AuthProvider>;
}

function StoreAccess({ storeKey, storeName, children }) {
  const auth = useAuth();
  const [loginRequest, setLoginRequest] = useState(null);
  const pending = useRef(null);
  // Modo real: carrega estoque e configurações do servidor e recarrega ao entrar ou sair (equipe vê contatos).
  const [storeError, setStoreError] = useState('');
  useEffect(() => {
    if (!storeSync.isRemote) return undefined;
    const off = storeSync.subscribe(storeKey, detail => { if (detail.type === 'STORE_ERROR') setStoreError(detail.message); });
    storeSync.hydrate(storeKey, { force: true }).then(() => setStoreError('')).catch(() => {});
    return off;
  }, [storeKey, auth.user?.id, auth.user?.role]);
  const requestLogin = (reason = '', action = null) => {
    pending.current = action;
    setLoginRequest({ reason });
  };
  const requireLogin = (action, reason = '') => {
    if (auth.user) action(auth.user);
    else requestLogin(reason, action);
  };
  const authorizeNavigation = (page, action) => {
    if (page === 'painel-lojista') {
      if (auth.isStaff) action(auth.user);
      else requestLogin('Entre com sua conta da loja para continuar.', account => { if (isStaffUser(account)) action(account); });
    } else if (Object.hasOwn(customerPages, page)) requireLogin(action, customerPages[page]);
    else action(auth.user);
  };
  const close = () => { pending.current = null; setLoginRequest(null); };
  const onLogin = account => {
    const action = pending.current;
    pending.current = null;
    setLoginRequest(null);
    action?.(account);
  };
  return <StoreAccessContext.Provider value={{ ...auth, storeKey, storeName, storeError, requestLogin, requireLogin, authorizeNavigation }}>
    {children}
    {loginRequest && <AccountLoginDialog reason={loginRequest.reason} storeKey={storeKey} storeName={storeName} onClose={close} onSuccess={onLogin} />}
  </StoreAccessContext.Provider>;
}

export function useStoreAccess() {
  const context = useContext(StoreAccessContext);
  if (!context) throw new Error('O acesso do site precisa de StoreAccessProvider.');
  return context;
}
