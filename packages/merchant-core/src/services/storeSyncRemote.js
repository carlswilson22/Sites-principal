/**
 * packages/merchant-core/src/services/storeSyncRemote.js
 * Mesma interface do storeSync, mas os dados vivem no servidor da loja (modo real).
 *
 * - O que o front lê vem de um cache em memória, preenchido por `hydrate` e renovado a cada poucos segundos.
 * - Toda alteração (salvar veículo, atualizar contato...) vai ao servidor primeiro; só depois o cache muda
 *   e os eventos de sempre (VEHICLES_UPDATED, LEADS_UPDATED) avisam as telas. Falha vira erro com texto amigável.
 * - As funções que alteram dados devolvem Promise: quem chama usa `await` (em demonstração continuam síncronas).
 */
import { apiFetch, ApiError, mediaPath, mediaUrl } from './remote.js';
import { VEHICLE_PLACEHOLDER, leadFromApi, leadToApi, vehicleFromApi, vehicleToApi } from '../utils/vehicleAdapter.js';

const EVENT_PREFIX = 'merchant_store_update_';
const POLL_MS = 20_000;
const state = { vehicles: [], leads: [], settings: null, ready: false, hydrating: null, timer: null };

const emit = (storeKey, detail) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${storeKey}`, { detail }));
};
const sameId = (a, b) => String(a) === String(b);

async function fetchVehicles() {
  const all = [];
  for (let offset = 0; offset < 1000; offset += 200) {
    const page = await apiFetch(`/vehicles?limit=200&offset=${offset}`);
    all.push(...page);
    if (page.length < 200) break;
  }
  return all.map(vehicle => vehicleFromApi(vehicle, mediaUrl));
}

async function refreshLeads(storeKey) {
  try {
    const leads = await apiFetch('/leads');
    state.leads = leads.map(leadFromApi);
  } catch (error) {
    // Visitante e atendente sem acesso a contatos: lista vazia, sem erro na tela.
    if (error instanceof ApiError && [401, 403].includes(error.status)) state.leads = [];
    else throw error;
  }
  emit(storeKey, { type: 'LEADS_UPDATED', leads: state.leads });
}

/** Sincroniza as fotos do veículo: apaga as removidas, envia as novas (data URL) e acerta ordem e capa. */
async function syncPhotos(vehicleId, records, desired, coverUrl) {
  const wanted = (Array.isArray(desired) ? desired : []).filter(url => typeof url === 'string' && url && url !== VEHICLE_PLACEHOLDER);
  const keep = [];
  for (const url of wanted) {
    if (url.startsWith('data:')) keep.push({ data: url });
    else {
      const record = records.find(item => item.url === mediaPath(url));
      if (record) keep.push({ id: record.id, url: record.url });
    }
  }
  for (const record of records) {
    if (!keep.some(item => item.id === record.id)) await apiFetch(`/vehicles/${vehicleId}/media/${record.id}`, { method: 'DELETE' });
  }
  for (const item of keep) {
    if (!item.data) continue;
    const created = await apiFetch(`/vehicles/${vehicleId}/media`, { method: 'POST', body: { kind: 'photo', data: item.data } });
    item.id = created.id;
    item.url = created.url;
  }
  for (let index = 0; index < keep.length; index += 1) {
    const before = records.findIndex(record => record.id === keep[index].id);
    if (before !== index) await apiFetch(`/vehicles/${vehicleId}/media/${keep[index].id}`, { method: 'PATCH', body: { order_index: index } });
  }
  if (keep.length) {
    const coverPath = coverUrl ? mediaPath(coverUrl) : null;
    const cover = keep.find(item => item.url === coverPath) || keep[0];
    await apiFetch(`/vehicles/${vehicleId}/media/${cover.id}`, { method: 'PATCH', body: { is_cover: true } });
  }
}

function startPolling(storeKey) {
  if (state.timer || typeof window === 'undefined') return;
  state.timer = window.setInterval(async () => {
    if (document.visibilityState === 'hidden') return;
    try {
      state.vehicles = await fetchVehicles();
      emit(storeKey, { type: 'VEHICLES_UPDATED', vehicles: state.vehicles });
      await refreshLeads(storeKey);
    } catch { /* tenta de novo no próximo ciclo; o que já está na tela continua */ }
  }, POLL_MS);
}

export const remoteStoreSync = {
  isRemote: true,

  /** Carrega estoque, configurações e (para a equipe) contatos. Pode ser chamada de novo após entrar ou sair. */
  hydrate(storeKey, { force = false } = {}) {
    if (state.hydrating && !force) return state.hydrating;
    state.hydrating = (async () => {
      try {
        const [vehicles, settings] = await Promise.all([fetchVehicles(), apiFetch('/settings/public')]);
        state.vehicles = vehicles;
        state.settings = settings;
        state.ready = true;
        emit(storeKey, { type: 'VEHICLES_UPDATED', vehicles });
        emit(storeKey, { type: 'SETTINGS_UPDATED', settings });
        await refreshLeads(storeKey);
        startPolling(storeKey);
      } catch (error) {
        emit(storeKey, { type: 'STORE_ERROR', message: error.message || 'Não foi possível carregar os dados da loja.' });
        throw error;
      } finally {
        state.hydrating = null;
      }
    })();
    return state.hydrating;
  },

  isReady() { return state.ready; },
  getSettings() { return state.settings; },

  // ---------- estoque ----------
  getVehicles() { return state.vehicles; },

  async saveVehicle(storeKey, vehicle) {
    const existing = state.vehicles.find(item => sameId(item.id, vehicle.id));
    const body = vehicleToApi(vehicle);
    let id;
    if (existing) {
      await apiFetch(`/vehicles/${existing.id}`, { method: 'PUT', body });
      id = existing.id;
    } else {
      id = (await apiFetch('/vehicles', { method: 'POST', body })).id;
    }
    await syncPhotos(id, existing?.photoRecords || [], vehicle.photos ?? vehicle.imagens, vehicle.cover_photo || vehicle.imagemPrincipal);
    const fresh = vehicleFromApi(await apiFetch(`/vehicles/${id}`), mediaUrl);
    state.vehicles = existing ? state.vehicles.map(item => (sameId(item.id, id) ? fresh : item)) : [fresh, ...state.vehicles];
    emit(storeKey, { type: 'VEHICLES_UPDATED', vehicles: state.vehicles });
    return state.vehicles;
  },

  async deleteVehicle(storeKey, vehicleId) {
    await apiFetch(`/vehicles/${vehicleId}`, { method: 'DELETE' });
    state.vehicles = state.vehicles.filter(item => !sameId(item.id, vehicleId));
    emit(storeKey, { type: 'VEHICLES_UPDATED', vehicles: state.vehicles });
    return state.vehicles;
  },

  // ---------- contatos ----------
  getLeads() { return state.leads; },

  async addLead(storeKey, lead) {
    await apiFetch('/leads', { method: 'POST', body: leadToApi(lead) });
    // A equipe vê o contato novo na lista; o visitante não tem acesso e a chamada abaixo é ignorada.
    await refreshLeads(storeKey).catch(() => {});
    return state.leads;
  },

  async updateLead(storeKey, leadId, updates) {
    const body = {};
    if (updates.status) body.status = updates.status;
    if (updates.temperature) body.temperature = updates.temperature;
    if (updates.note) body.note = String(updates.note).slice(0, 500);
    if (Object.keys(body).length) await apiFetch(`/leads/${leadId}/status`, { method: 'PATCH', body });
    await refreshLeads(storeKey);
    return state.leads;
  },

  // ---------- clientes, contratos e despesas: ainda não ligados ao servidor ----------
  getRecords() { return []; },
  async saveRecord() { throw new Error('Este módulo ainda não está conectado ao servidor da loja.'); },
  async deleteRecord() { throw new Error('Este módulo ainda não está conectado ao servidor da loja.'); },

  subscribe(storeKey, callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = event => { if (event.detail) callback(event.detail); };
    window.addEventListener(`${EVENT_PREFIX}${storeKey}`, handler);
    return () => window.removeEventListener(`${EVENT_PREFIX}${storeKey}`, handler);
  }
};
