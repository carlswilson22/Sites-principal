const TYPES = ['page_view', 'vehicle_view', 'whatsapp_click'];
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_EVENTS = 10000;

export function summarizeAnalytics(events, vehicles = [], days = 30, now = Date.now()) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const filtered = events.filter(event => TYPES.includes(event.type) && Date.parse(event.created_at) >= cutoff && Date.parse(event.created_at) <= now);
  const ranking = new Map();
  for (const event of filtered) {
    if (event.vehicle_id == null) continue;
    const id = String(event.vehicle_id);
    const item = ranking.get(id) || { id, views: 0, whatsapp: 0 };
    if (event.type === 'vehicle_view') item.views++;
    if (event.type === 'whatsapp_click') item.whatsapp++;
    ranking.set(id, item);
  }
  return {
    pageViews: filtered.filter(event => event.type === 'page_view').length,
    vehicleViews: filtered.filter(event => event.type === 'vehicle_view').length,
    whatsappClicks: filtered.filter(event => event.type === 'whatsapp_click').length,
    ranking: [...ranking.values()].map(item => ({ ...item,
      title: vehicles.find(vehicle => String(vehicle.id) === item.id)?.nome || `Veículo ${item.id} (fora do estoque)`,
    })).sort((first, second) => second.views - first.views || second.whatsapp - first.whatsapp),
  };
}

export const siteAnalytics = {
  getEvents(storeKey) {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(`store_analytics_${storeKey}`);
    if (raw === null) return [];
    const events = JSON.parse(raw);
    if (!Array.isArray(events) || events.some(event => !event || typeof event !== 'object')) throw new Error('Métricas locais inválidas.');
    return events;
  },
  track(storeKey, { type, page, vehicleId }, now = Date.now()) {
    if (typeof window === 'undefined' || !TYPES.includes(type) || !Number.isFinite(now)) return false;
    try {
      const previous = this.getEvents(storeKey).filter(event => Date.parse(event.created_at) >= now - RETENTION_MS);
      const event = { type, created_at: new Date(now).toISOString() };
      if (page) event.page = String(page).slice(0, 40);
      if (vehicleId != null) event.vehicle_id = String(vehicleId).slice(0, 80);
      const events = [...previous, event].slice(-MAX_EVENTS);
      localStorage.setItem(`store_analytics_${storeKey}`, JSON.stringify(events));
      window.dispatchEvent(new CustomEvent(`merchant_store_update_${storeKey}`, { detail: { type: 'ANALYTICS_UPDATED', analytics: events } }));
      return true;
    } catch {
      // Métricas opcionais não interrompem a navegação nem substituem dados inválidos.
      return false;
    }
  },
};
