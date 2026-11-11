import { isDemoMode, createDemoAccount } from './demoConfig';
import { loginDemoCustomer, registerDemoCustomer } from './demoCustomerAccounts.js';
/**
 * packages/merchant-core/src/services/apiClient.js
 * Adaptador de dados híbrido:
 * - Em desenvolvimento/produção com servidor: Consome a API HTTP nativa.
 * - Em demonstração estática (GitHub Pages): Opera com repositório seguro em memória/LocalStorage.
 */

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : '/api';

async function optionalApi(...args) {
  if (isDemoMode) return null;
  try {
    const response = await fetch(...args);
    if (response.ok) return await response.json();
  } catch {}
  return null;
}

async function toolApi(path, options, sample) {
  if (isDemoMode) return sample();
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...options });
  if (!response.ok) throw new Error('Não foi possível concluir a operação. Tente novamente.');
  return response.json();
}
const jsonPost = payload => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
const loadSamples = async () => (await import('./demoTools.js')).demoTools;

export const apiClient = {
  async getSummary(tier = 1) {
    const result = await optionalApi(`${API_BASE_URL}/dashboard/summary`, { credentials: 'include' });
    if (result !== null) return result;

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

  async login(email, password, storeKey = 'default') {
    if (isDemoMode) {
      try { return { user: createDemoAccount(email, password) }; }
      catch { return { user: await loginDemoCustomer(storeKey, email, password) }; }
    }
    const res = await fetch(API_BASE_URL + '/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }), credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao autenticar.');
    return data;
  },
  async registerCustomer(details, storeKey) {
    if (!isDemoMode) throw new Error('O cadastro precisa ser conectado ao servidor da loja.');
    return { user: await registerDemoCustomer(storeKey, details) };
  },
  async getSession() {
    const res = await fetch(API_BASE_URL + '/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()).user;
  },
  async logout() {
    if (isDemoMode) return;
    const res = await fetch(API_BASE_URL + '/auth/logout', { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error('Nao foi possivel encerrar a sessao. Tente novamente.');
  },

  // E6: Registro de Contato (Leads do site)
  async captureLead(leadData) {
    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback para persistência em LocalStorage no GitHub Pages
    }

    try {
      const stored = JSON.parse(localStorage.getItem('merchant_leads') || '[]');
      const newLead = {
        id: Date.now(),
        ...leadData,
        status: 'novo',
        temperature: 'quente',
        created_at: new Date().toISOString()
      };
      stored.unshift(newLead);
      localStorage.setItem('merchant_leads', JSON.stringify(stored));
      return { success: true, lead: newLead };
    } catch {
      return { success: true };
    }
  },

  // ==========================================
  // NÍVEL 3 (A1 a A8)
  // ==========================================

  // A1: Consignações
  async getConsignments(storeKey, vehicles = []) {
    return toolApi('/tier3/consignments', {}, async () => (await loadSamples()).consignments(storeKey, vehicles));
  },

  async saveConsignment(data, storeKey, vehicles = []) {
    return toolApi('/tier3/consignments', jsonPost(data), async () => (await loadSamples()).saveConsignment(storeKey, data, vehicles));
  },

  async getConsignmentAlerts(storeKey, vehicles = []) {
    return toolApi('/tier3/consignments/alerts', {}, async () => {
      const list = (await loadSamples()).consignments(storeKey, vehicles);
      return { uncontractedVehicles: [], expiringConsignments: list.filter(item => item.expiry.isExpired || item.expiry.daysRemaining <= 7) };
    });
  },

  // A2: Contratos Avançados
  async createAdvancedContract(data, storeKey, vehicles = [], dealership = {}) {
    return toolApi('/tier3/contracts/advanced', jsonPost(data), async () => (await loadSamples()).createContract(storeKey, data, vehicles, dealership));
  },

  // A3: Financeiro Completo & DRE
  async getFullFinancial() {
    const result = await optionalApi(`${API_BASE_URL}/tier3/financial/full`, { credentials: 'include' });
    if (result !== null) return result;

    return {
      ownStock: { count: 8, total_retail_value: 820000, total_invested: 645000 },
      consignedStock: { count: 4, total_retail_value: 390000 },
      salesMetrics: { totalSoldCars: 6, totalSalesRevenue: 580000, totalRealizedProfit: 78500 },
      sellersCommissions: [
        { sellerId: 3, name: 'Lucas Lima (Atendente)', email: 'atendente@lojaexemplo.com.br', salesCount: 4, totalSold: 390000, commissionAmount: 5850 }
      ],
      bankReport: {
        storeName: 'Auto-Dealership Enterprise Veículos',
        generatedAt: new Date().toISOString(),
        activeInventoryCount: 12,
        activeInventoryValue: 1210000,
        ownStockInvestedCapital: 645000,
        last12MonthsGrossRevenue: 580000,
        last12MonthsNetProfit: 78500,
        financialHealthIndex: 'A+'
      }
    };
  },

  // A4: Precificador Completo
  async calculateMarketPricing(payload) {
    return toolApi('/tier3/market-pricing', jsonPost(payload), async () => (await import('../utils/marketPricing.js')).calculateMarketPricing(payload));
  },

  // A5: Funil de Vendas & Giro
  async getSalesFunnel() {
    const result = await optionalApi(`${API_BASE_URL}/tier3/funnel`, { credentials: 'include' });
    if (result !== null) return result;

    return {
      funnelSteps: [
        { step: 'Visitas ao Site', count: 4850, rate: 100 },
        { step: 'Veículos Visualizados', count: 1920, rate: 39.5 },
        { step: 'Simulações & WhatsApp', count: 340, rate: 7.0 },
        { step: 'Leads Criados', count: 125, rate: 2.6 },
        { step: 'Em Atendimento', count: 48, rate: 1.0 },
        { step: 'Vendas Fechadas', count: 18, rate: 0.4 }
      ],
      averageResponseTimeMinutes: 18,
      staleVehiclesAlert: {
        totalStale: 1,
        vehicles: [
          { id: 2, title: 'Aventureiro Cross Pro', price: 89900, days_in_stock: 68, suggestedDiscountPercent: 4, suggestedNewPrice: 86300 }
        ]
      }
    };
  },

  // A6 & A7: Stories e Instagram
  async getInstagramStatus(storeKey) {
    return toolApi('/tier3/instagram/status', {}, async () => (await loadSamples()).instagramStatus(storeKey));
  },

  async publishInstagramStory(payload, storeKey) {
    return toolApi('/tier3/instagram/queue', jsonPost(payload), async () => (await loadSamples()).publish(storeKey, payload));
  },

  async getInstagramHistory(storeKey) {
    return toolApi('/tier3/instagram/history', {}, async () => (await loadSamples()).history(storeKey));
  },

  // A8: Auditoria & LGPD
  async getAuditLogs(storeKey) {
    return toolApi('/tier3/audit', {}, async () => (await loadSamples()).audit(storeKey));
  },

  async exportLgpdData(clientId, storeKey) {
    return toolApi('/tier3/lgpd/export/' + encodeURIComponent(clientId), {}, async () => (await loadSamples()).exportClient(storeKey, clientId));
  },

  async anonymizeLgpd(clientId, storeKey) {
    return toolApi('/tier3/lgpd/anonymize/' + encodeURIComponent(clientId), { method: 'POST' }, async () => (await loadSamples()).anonymize(storeKey, clientId));
  }
};
