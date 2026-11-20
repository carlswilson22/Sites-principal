/**
 * packages/merchant-core/src/utils/vehicleAdapter.js
 * Tradutor entre o veículo do protótipo (nomes em português, ex.: nome, preco, imagens) e o do servidor
 * (title, price, photos...). Usado só no modo real. O protótipo já entende os dois nomes (normalizeVehicle).
 */
import { normalizeVehicle } from './vehicles.js';

const PLACEHOLDER = '/images/placeholder-carro.jpg';

const SOURCE_FROM_API = { site_formulario: 'formulario_site', site_whatsapp: 'whatsapp_site', simulador_financiamento: 'simulador_financiamento', avaliacao_troca: 'avaliacao_troca' };
const SOURCE_TO_API = { formulario_site: 'site_formulario', concierge_site: 'site_formulario', alerta_preco: 'site_formulario', whatsapp_site: 'site_whatsapp', simulador_financiamento: 'simulador_financiamento', avaliacao_troca: 'avaliacao_troca', avaliacao_usado: 'avaliacao_troca' };

/** Veículo do servidor -> veículo do protótipo. `toUrl` resolve o endereço das fotos. */
export function vehicleFromApi(v, toUrl = url => url) {
  const photos = Array.isArray(v.photos) ? v.photos : [];
  const urls = photos.map(photo => toUrl(photo.url));
  const frames = (Array.isArray(v.frames360) ? v.frames360 : []).map(frame => toUrl(frame.url));
  const cover = photos.find(photo => photo.is_cover) || photos[0];
  const report = v.report_data && typeof v.report_data === 'object' ? v.report_data : null;
  return normalizeVehicle({
    ...v,
    categoria: v.category === 'picape' ? 'pickup' : v.category,
    marca: v.brand || undefined,
    photos: urls,
    cover_photo: cover ? toUrl(cover.url) : (v.cover_photo ? toUrl(v.cover_photo) : undefined),
    imagens360: frames,
    frames360: frames,
    // Registros de mídia do servidor (ids), usados para sincronizar fotos ao salvar
    photoRecords: photos.map(photo => ({ id: photo.id, url: photo.url })),
    precoOriginal: v.original_price || undefined,
    destaque: Boolean(v.highlight),
    tag: Array.isArray(v.tags) && v.tags.length ? v.tags[0] : undefined,
    dossieOficial: v.dossier && typeof v.dossier === 'object' ? v.dossier : undefined,
    laudoCautelar: report || undefined,
    fichaTecnica: v.spec_sheet && typeof v.spec_sheet === 'object' ? v.spec_sheet : undefined,
    fipeReferencia: v.fipe_reference_price || undefined,
    descricao: v.notes || undefined
  });
}

const number = value => { const n = Number(value); return Number.isFinite(n) ? n : undefined; };

/** Veículo do protótipo (ou do formulário do painel) -> corpo aceito pela API. Fotos são tratadas à parte. */
export function vehicleToApi(vehicle) {
  const pick = (...keys) => { for (const key of keys) if (vehicle[key] !== undefined && vehicle[key] !== null && vehicle[key] !== '') return vehicle[key]; return undefined; };
  const body = {
    title: pick('title', 'nome'), version: pick('version', 'versao'), brand: pick('brand', 'marca'),
    category: pick('category', 'categoria'), year: String(pick('year', 'ano') ?? ''), km: number(vehicle.km),
    transmission: pick('transmission', 'cambio'), fuel: pick('fuel', 'combustivel'), color: pick('color', 'cor'),
    doors: number(pick('doors', 'portas')), engine: pick('engine', 'motor'), power: pick('power', 'potencia'),
    price: number(pick('price', 'preco')), original_price: number(pick('original_price', 'precoOriginal')),
    status: vehicle.status, ownership_type: vehicle.ownership_type,
    is_published: [0, false, '0'].includes(vehicle.is_published) ? 0 : 1,
    highlight: Boolean(pick('highlight', 'destaque')),
    days_in_stock: number(vehicle.days_in_stock), notes: pick('notes', 'descricao'),
    features: pick('features', 'opcionais'), tags: vehicle.tags
  };
  if (body.year === '') delete body.year;
  if (body.category === 'picape') body.category = 'pickup';
  if (vehicle.dossieOficial || vehicle.dossier) body.dossier = vehicle.dossieOficial || vehicle.dossier;
  if (vehicle.laudoCautelar || vehicle.report_data) body.report_data = vehicle.laudoCautelar || vehicle.report_data;
  if (vehicle.fichaTecnica || vehicle.spec_sheet) body.spec_sheet = vehicle.fichaTecnica || vehicle.spec_sheet;
  for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];
  return body;
}

/** Contato do servidor -> contato do protótipo. */
export function leadFromApi(lead) {
  return {
    ...lead,
    vehicleId: lead.vehicle_id ?? undefined,
    vehicleName: lead.vehicle_title || undefined,
    source: SOURCE_FROM_API[lead.source] || lead.source,
    sourceApi: lead.source,
    simulation: safeJson(lead.simulation_data)
  };
}

/** Contato do protótipo -> corpo do POST /api/leads. */
export function leadToApi(lead) {
  const body = {
    name: lead.name, phone: lead.phone, email: lead.email || undefined, message: lead.message || undefined,
    source: SOURCE_TO_API[lead.source] || 'site_formulario', consent: lead.consent === true
  };
  const vehicleId = number(lead.vehicle_id ?? lead.vehicleId);
  if (Number.isInteger(vehicleId) && vehicleId > 0) body.vehicle_id = vehicleId;
  if (lead.simulation_data || lead.simulation) body.simulation_data = lead.simulation_data || lead.simulation;
  return body;
}

function safeJson(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

export { PLACEHOLDER as VEHICLE_PLACEHOLDER };
