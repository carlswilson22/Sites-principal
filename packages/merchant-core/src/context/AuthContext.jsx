import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { demoSessionKey, isDemoMode, isStaffUser, readDemoSession } from '../services/demoConfig';

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
      apiClient.getSession().then(account => { if (active) setUser(isStaffUser(account) ? account : null); })
        .catch(() => { if (active) setUser(null); }).finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [storeKey]);

  const login = async (email, password, audience = 'staff') => {
    const result = await apiClient.login(String(email).trim().toLowerCase(), password, audience);
    if (audience === 'staff' ? !isStaffUser(result.user) : result.user?.role !== 'cliente') throw new Error('Este perfil não pertence ao tipo de acesso escolhido.');
    if (isDemoMode) {
      try { sessionStorage.setItem(demoSessionKey(storeKey), JSON.stringify({ storeKey, user: result.user, expiresAt: Date.now() + 4 * 60 * 60 * 1000 })); } catch {}
    }
    setUser(result.user);
    return result.user;
  };
  const logout = async () => {
    await apiClient.logout();
    try { sessionStorage.removeItem(demoSessionKey(storeKey)); sessionStorage.removeItem('merchant_demo_user'); localStorage.removeItem('merchant_user'); } catch {}
    setUser(null);
  };
  const hasRole = allowed => isStaffUser(user) && (user.role === 'proprietario' || allowed.includes(user.role));
  return <AuthContext.Provider value={{ user, role: user?.role || 'visitante', isAuthenticated: !!user, isStaff: isStaffUser(user), hasRole, login, logout, loading, isDemoMode }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  return context;
}
