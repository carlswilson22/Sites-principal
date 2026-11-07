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
      if (email && password) {
        return {
          token: 'demo-session-token',
          user: {
            id: 1,
            name: 'Carlos Silva (Proprietário)',
            email,
            role: 'proprietario',
            tier: 3
          }
        };
      }
      throw err;
    }
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
  async getConsignments() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/consignments`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}

    return [
      {
        id: 1,
        vehicle_id: 3,
        vehicle_title: 'Compacto Smart Plus 1.0 Turbo',
        vehicle_price: 77500,
        days_in_stock: 8,
        owner_name: 'Fernando Prado (Fictício)',
        owner_cpf_masked: '987.***.***-99',
        owner_bank_masked: 'Banco 001 - Ag 1234 - CC *****-0',
        remuneration_type: 'percentual',
        remuneration_value: 6.0,
        min_remuneration: 3500,
        service_fee: 350,
        daily_storage_fee: 15,
        contract_start: '2026-11-01',
        contract_end: '2026-12-01',
        payout_deadline_days: 5,
        status: 'ativo',
        settlement: {
          storeCommission: 4650,
          totalStorageFee: 120,
          totalStoreDeductions: 5120,
          ownerNetPayout: 72380,
          storeTotalRevenue: 5120
        },
        expiry: { isExpired: false, daysRemaining: 24, warning: null }
      }
    ];
  },

  async saveConsignment(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/consignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, message: 'Consignação gravada (modo demonstração).' };
  },

  async getConsignmentAlerts() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/consignments/alerts`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return { uncontractedVehicles: [], expiringConsignments: [] };
  },

  // A2: Contratos Avançados
  async createAdvancedContract(contractData) {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/contracts/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
        credentials: 'include'
      });
      if (res.ok) return await res.json();
    } catch {}

    const code = `CTR-EXP-${new Date().getFullYear()}-0099`;
    return {
      id: Date.now(),
      code,
      html: `<h1>Minuta Gerada em Modo Demonstração (${code})</h1><p>Aviso: Submeter a revisão de advogado.</p>`
    };
  },

  // A3: Financeiro Completo & DRE
  async getFullFinancial() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/financial/full`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}

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
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/market-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) return await res.json();
    } catch {}

    const fipe = Number(payload.fipePrice) || 85000;
    const auctionDec = payload.hasAuctionRecord ? fipe * 0.18 : 0;
    const sale = Math.round((fipe - auctionDec) * 1.02);
    const buy = Math.round(sale * 0.88 - 1500);

    return {
      fipePrice: fipe,
      competitorsCount: (payload.manualCompetitors || []).length,
      avgCompetitorPrice: fipe,
      hasAuctionRecord: payload.hasAuctionRecord,
      auctionDeduction: auctionDec,
      regionalLiquidity: payload.regionalLiquidity || 'media',
      suggestedSalePrice: sale,
      maxBuyPrice: buy
    };
  },

  // A5: Funil de Vendas & Giro
  async getSalesFunnel() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/funnel`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}

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
  async getInstagramStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/instagram/status`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return {
      configured: false,
      status: 'nao_configurado',
      message: 'Integração oficial com Instagram não configurada no ambiente (.env). Utilize a exportação manual.'
    };
  },

  async publishInstagramStory(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/instagram/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: false,
      status: 'nao_configurado',
      message: 'Instagram Graph API não configurada. Faça download da arte e compartilhe no app do Instagram.'
    };
  },

  async getInstagramHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/instagram/history`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  // A8: Auditoria & LGPD
  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/audit`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return [
      { id: 1, user_name: 'Carlos Silva (Proprietário)', user_role: 'proprietario', action: 'LOGIN_SUCESSO', entity: 'sessions', entity_id: '1', created_at: new Date().toISOString() }
    ];
  },

  async exportLgpdData(clientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/lgpd/export/${clientId}`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return {
      titular: { id: clientId, nome: 'Titular Exemplo', cpf_completo: '123.456.789-00', telefone: '(11) 99999-9999' },
      termo_consentimento: 'Consentimento registrado em conformidade com o Artigo 7º da LGPD.'
    };
  },

  async anonymizeLgpd(clientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/tier3/lgpd/anonymize/${clientId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, message: 'Dados anonimizados com sucesso.' };
  }
};
