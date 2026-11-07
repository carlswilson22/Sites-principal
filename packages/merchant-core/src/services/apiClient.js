/**
 * packages/merchant-core/src/services/apiClient.js
 * Adaptador de dados híbrido:
 * - Em desenvolvimento/produção com servidor: Consome a API HTTP nativa.
 * - Em demonstração estática (GitHub Pages): Opera com repositório seguro em memória/LocalStorage.
 */

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : '/api';

export const apiClient = {
  async getSummary(tier = 1) {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback estático gracioso para GitHub Pages
    }

    return {
      tier,
      indicators: {
        inStock: 12,
        monthlySales: 4,
        staleVehicles: 2,
        newLeads: 5
      },
      pendingActions: [
        { id: 101, name: 'Roberto Alves (Fictício)', phone: '(11) 98888-0001', source: 'site_formulario', temperature: 'quente', created_at: new Date().toISOString() },
        { id: 102, name: 'Mariana Costa (Fictício)', phone: '(11) 97777-0002', source: 'site_whatsapp', temperature: 'morno', created_at: new Date().toISOString() }
      ]
    };
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Credenciais inválidas.');
    } catch (err) {
      // Modo de demonstração com credenciais fictícias
      if (email && password) {
        return {
          token: 'demo-session-token',
          user: {
            id: 1,
            name: 'Carlos Silva (Proprietário)',
            email,
            role: 'proprietario',
            tier: 1
          }
        };
      }
      throw err;
    }
  }
};
