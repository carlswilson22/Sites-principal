import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { demoSessionKey, isDemoMode, isStaffUser, isStoreUser, readDemoSession } from '../services/demoConfig';

const AuthContext = createContext(null);
function storedSession(storeKey) {
  if (!isDemoMode || typeof window === 'undefined') return null;
  try { return readDemoSession(sessionStorage.getItem(demoSessionKey(storeKey)), storeKey); }
  catch { return null; }
}

export function AuthProvider({ children, storeKey = 'default' }) {
  const [user, setUser] = useState(() => storedSession(storeKey));
  const [loading, setLoading] = useState(!isDemoMode);
  useEffect(() => {
    let active = true;
    if (isDemoMode) { setUser(storedSession(storeKey)); setLoading(false); }
    else {
      setLoading(true);
      apiClient.getSession().then(account => { if (active) setUser(isStoreUser(account) ? account : null); })
        .catch(() => { if (active) setUser(null); }).finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [storeKey]);

  const activate = account => {
    if (isDemoMode) {
      try { sessionStorage.setItem(demoSessionKey(storeKey), JSON.stringify({ storeKey, user: account, expiresAt: Date.now() + 4 * 60 * 60 * 1000 })); } catch {}
    }
    setUser(account);
    return account;
  };
  const login = async (email, password, { staffOnly = false } = {}) => {
    const result = await apiClient.login(String(email).trim().toLowerCase(), password, storeKey);
    if (!isStoreUser(result.user)) throw new Error('Este perfil não tem acesso ao site.');
    if (staffOnly && !isStaffUser(result.user)) throw new Error('O painel é exclusivo da equipe da loja.');
    return activate(result.user);
  };
  const register = async details => {
    const result = await apiClient.registerCustomer(details, storeKey);
    if (result.user?.role !== 'cliente') throw new Error('O cadastro público é exclusivo de clientes.');
    return activate(result.user);
  };
  const logout = async () => {
    await apiClient.logout();
    try { sessionStorage.removeItem(demoSessionKey(storeKey)); sessionStorage.removeItem('merchant_demo_user'); localStorage.removeItem('merchant_user'); } catch {}
    setUser(null);
  };
  const hasRole = allowed => isStaffUser(user) && (user.role === 'proprietario' || allowed.includes(user.role));
  return <AuthContext.Provider value={{ user, role: user?.role || 'visitante', isAuthenticated: !!user, isStaff: isStaffUser(user), hasRole, login, register, logout, loading, isDemoMode }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  return context;
}
