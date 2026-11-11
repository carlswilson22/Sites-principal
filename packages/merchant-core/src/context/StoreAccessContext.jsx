import React, { createContext, useContext, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AccountLoginDialog } from '../components/common/AccountLoginDialog';
import { customerPages } from '../utils/siteAccess';
import { isStaffUser } from '../services/demoConfig';

const StoreAccessContext = createContext(null);

export function StoreAccessProvider({ storeKey, storeName, children }) {
  return <AuthProvider storeKey={storeKey}><StoreAccess storeKey={storeKey} storeName={storeName}>{children}</StoreAccess></AuthProvider>;
}

function StoreAccess({ storeKey, storeName, children }) {
  const auth = useAuth();
  const [loginRequest, setLoginRequest] = useState(null);
  const pending = useRef(null);
  const requestLogin = (audience = 'customer', reason = '', action = null) => {
    pending.current = action;
    setLoginRequest({ audience, reason });
  };
  const requireLogin = (action, reason = '') => {
    if (auth.user) action(auth.user);
    else requestLogin('customer', reason, action);
  };
  const authorizeNavigation = (page, action) => {
    if (page === 'painel-lojista') {
      if (auth.isStaff) action(auth.user);
      else requestLogin('staff', '', account => { if (isStaffUser(account)) action(account); });
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
  return <StoreAccessContext.Provider value={{ ...auth, storeKey, storeName, requestLogin, requireLogin, authorizeNavigation }}>
    {children}
    {loginRequest && <AccountLoginDialog key={loginRequest.audience} audience={loginRequest.audience} reason={loginRequest.reason} storeName={storeName} onClose={close} onSuccess={onLogin} />}
  </StoreAccessContext.Provider>;
}

export function useStoreAccess() {
  const context = useContext(StoreAccessContext);
  if (!context) throw new Error('O acesso do site precisa de StoreAccessProvider.');
  return context;
}
