import { isDemoMode, demoRoles } from '../services/demoConfig';
/**
 * packages/merchant-core/src/context/AuthContext.jsx
 * Contexto de autenticação, perfis de acesso (RBAC) e controle de sessão.
 */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa sessão do armazenamento local
  useEffect(() => {
    try {
      const stored = isDemoMode ? sessionStorage.getItem('merchant_demo_user') : null;
      if (stored && JSON.parse(stored).demo === true && demoRoles.includes(JSON.parse(stored).role)) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDemoMode) {
      setLoading(true);
      apiClient.getSession().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.login(email, password);
    setUser(res.user);
    if (isDemoMode) sessionStorage.setItem('merchant_demo_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    try { await apiClient.logout(); } catch (error) { window.alert(error.message); return; }
    setUser(null);
    sessionStorage.removeItem('merchant_demo_user');
    localStorage.removeItem('merchant_user');
  };

  const switchRole = (newRole) => {
    if (!isDemoMode || !user || !demoRoles.includes(newRole)) return;
    const names = {
      proprietario: 'Carlos Silva (Proprietário)',
      gerente: 'Fernanda Lima (Gerente)',
      atendente: 'Lucas Mendes (Atendente)'
    };
    const updated = {
      ...user,
      role: newRole,
      name: names[newRole] || user.name
    };
    setUser(updated);
    sessionStorage.setItem('merchant_demo_user', JSON.stringify(updated));
  };

  const hasRole = (allowedRoles = []) => {
    if (!user) return false;
    if (user.role === 'proprietario') return true;
    return allowedRoles.includes(user.role);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    role: user?.role || 'atendente',
    hasRole,
    login,
    logout,
    switchRole,
    isDemoMode,
    loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
}

