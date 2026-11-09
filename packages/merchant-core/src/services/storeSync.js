/**
 * packages/merchant-core/src/services/storeSync.js
 * Camada de sincronização de dados bi-direcional e isolamento por loja (Single-Tenant).
 * 
 * Funcionalidades:
 * - Persistência reativa no LocalStorage por storeKey (ex: 'autoelite', 'drivenow', 'apexluxury')
 * - Sincronização em tempo real entre a Vitrine Pública e o Painel do Lojista via CustomEvents
 * - Suporte híbrido: opera offline/estático no GitHub Pages e conecta ao backend local quando disponível
 */

const EVENT_PREFIX = 'merchant_store_update_';

export const storeSync = {
  getRecords(storeKey, collection, fallback = []) {
    if (!['clients', 'contracts'].includes(collection)) throw new Error('Coleção inválida.');
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(`store_${collection}_${storeKey}`);
    if (raw === null) return fallback;
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) throw new Error('Dados locais inválidos.');
    return records;
  },

  saveRecord(storeKey, collection, record) {
    const records = this.getRecords(storeKey, collection);
    const saved = {
      ...record,
      id: record.id || globalThis.crypto.randomUUID(),
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [saved, ...records.filter(item => item.id !== saved.id)];
    localStorage.setItem(`store_${collection}_${storeKey}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${storeKey}`, {
      detail: { type: `${collection.toUpperCase()}_UPDATED`, [collection]: updated }
    }));
    return updated;
  },
  /**
   * Obtém os veículos da loja
   */
  getVehicles(storeKey, fallbackData = []) {
    if (typeof window === 'undefined') return fallbackData;
    try {
      const raw = localStorage.getItem(`store_vehicles_${storeKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      // Inicializa com os dados iniciais do modelo se ainda não existir
      if (fallbackData && fallbackData.length > 0) {
        localStorage.setItem(`store_vehicles_${storeKey}`, JSON.stringify(fallbackData));
      }
      return fallbackData;
    } catch {
      return fallbackData;
    }
  },

  /**
   * Salva ou atualiza um veículo no estoque da loja
   */
  saveVehicle(storeKey, vehicle, fallbackData = []) {
    const list = this.getVehicles(storeKey, fallbackData);
    let updated;
    const exists = list.some(v => v.id === vehicle.id);
    if (exists) {
      updated = list.map(v => v.id === vehicle.id ? { ...v, ...vehicle, updatedAt: new Date().toISOString() } : v);
    } else {
      const newId = vehicle.id || (list.length > 0 ? Math.max(...list.map(v => Number(v.id) || 0)) + 1 : 1);
      const newVehicle = {
        ...vehicle,
        id: newId,
        createdAt: vehicle.createdAt || new Date().toISOString(),
        is_published: vehicle.is_published !== undefined ? vehicle.is_published : 1,
        days_in_stock: vehicle.days_in_stock || 1
      };
      updated = [newVehicle, ...list];
    }

    try {
      localStorage.setItem(`store_vehicles_${storeKey}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${storeKey}`, {
        detail: { type: 'VEHICLES_UPDATED', vehicles: updated }
      }));
    } catch (e) {
      console.warn('Erro ao persistir veículo no storage:', e);
    }

    return updated;
  },

  /**
   * Remove um veículo do estoque da loja
   */
  deleteVehicle(storeKey, vehicleId, fallbackData = []) {
    const list = this.getVehicles(storeKey, fallbackData);
    const updated = list.filter(v => v.id !== vehicleId);

    try {
      localStorage.setItem(`store_vehicles_${storeKey}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${storeKey}`, {
        detail: { type: 'VEHICLES_UPDATED', vehicles: updated }
      }));
    } catch (e) {
      console.warn('Erro ao remover veículo do storage:', e);
    }

    return updated;
  },

  /**
   * Obtém a lista de leads/contatos da loja
   */
  getLeads(storeKey) {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`store_leads_${storeKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        return [];
      }

      // Seed inicial de demonstração fictício
      const initialLeads = [
        {
          id: 1,
          name: 'Roberto Alves (Fictício)',
          phone: '(11) 98888-0001',
          email: 'roberto.alves@exemplo.com.br',
          vehicleName: 'Chevrolet Tracker 1.2 Turbo',
          vehicleId: 1,
          message: 'Gostaria de saber se aceitam seminovo na troca e qual o valor da entrada mínima.',
          source: 'formulario_site',
          status: 'novo',
          temperature: 'quente',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          assignedTo: 'Carlos Silva (Proprietário)'
        },
        {
          id: 2,
          name: 'Mariana Costa (Fictício)',
          phone: '(11) 97777-0002',
          email: 'mariana.costa@exemplo.com.br',
          vehicleName: 'Toyota Corolla Cross',
          vehicleId: 2,
          message: 'Tenho interesse no financiamento com entrada de 30% em 36 vezes.',
          source: 'simulador_financiamento',
          status: 'em_atendimento',
          temperature: 'morno',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          assignedTo: 'Marcos Oliveira (Atendente)'
        }
      ];

      localStorage.setItem(`store_leads_${storeKey}`, JSON.stringify(initialLeads));
      return initialLeads;
    } catch {
      return [];
    }
  },

  /**
   * Registra um novo lead (capturado do site público ou criado no painel)
   */
  addLead(storeKey, lead) {
    const list = this.getLeads(storeKey);
    const newLead = {
      ...lead,
      vehicle_id: lead.vehicle_id ?? lead.vehicleId,
      vehicle_title: lead.vehicle_title ?? lead.vehicleName,
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: lead.status || 'novo',
      temperature: lead.temperature || 'quente',
      created_at: new Date().toISOString()
    };
    const updated = [newLead, ...list];

    try {
      localStorage.setItem(`store_leads_${storeKey}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${storeKey}`, {
        detail: { type: 'LEADS_UPDATED', leads: updated }
      }));
    } catch (e) {
      console.warn('Erro ao persistir lead no storage:', e);
    }

    return updated;
  },

  /**
   * Atualiza status ou dados de um lead
   */
  updateLead(storeKey, leadId, updates) {
    const list = this.getLeads(storeKey);
    const updated = list.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l);

    try {
      localStorage.setItem(`store_leads_${storeKey}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${storeKey}`, {
        detail: { type: 'LEADS_UPDATED', leads: updated }
      }));
    } catch (e) {
      console.warn('Erro ao atualizar lead:', e);
    }

    return updated;
  },

  /**
   * Subscrição reativa para escutar mudanças no estoque ou leads
   */
  subscribe(storeKey, callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (event) => {
      if (event.detail) callback(event.detail);
    };
    window.addEventListener(`${EVENT_PREFIX}${storeKey}`, handler);
    const storageHandler = (event) => {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
      const collections = ['vehicles', 'leads', 'clients', 'contracts'];
      const collection = collections.find(name => event.key === `store_${name}_${storeKey}`);
      if (event.key !== null && !collection) return;
      try {
        const data = event.newValue === null ? [] : JSON.parse(event.newValue);
        if (!Array.isArray(data)) return;
        for (const name of event.key === null ? collections : [collection]) {
          callback({ type: `${name.toUpperCase()}_UPDATED`, [name]: data });
        }
      } catch {
        // Ignora dados externos inválidos e preserva o estado atual.
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(`${EVENT_PREFIX}${storeKey}`, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }
};

