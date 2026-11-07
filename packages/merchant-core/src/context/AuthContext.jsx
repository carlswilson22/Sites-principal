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

  // Inicializa sessão do armazenamento local para demonstração/persistência
  useEffect(() => {
    try {
      const stored = localStorage.getItem('merchant_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Usuário padrão inicial de demonstração
        const demoUser = {
          id: 1,
          name: 'Carlos Silva (Proprietário)',
          email: 'proprietario@autodealership.com.br',
          role: 'proprietario',
          tier: 1
        };
        setUser(demoUser);
        localStorage.setItem('merchant_user', JSON.stringify(demoUser));
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.login(email, password);
    setUser(res.user);
    localStorage.setItem('merchant_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('merchant_user');
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

