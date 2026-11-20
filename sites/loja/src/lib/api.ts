/**
 * Acesso à API da loja. Cache curto na memória (o estoque muda pouco, mas uma venda precisa sair do ar em segundos)
 * e tolerância a falha: se a API não responder, o site serve a última cópia por até 10 minutos.
 */
import { API_URL } from './config';

export class ApiUnavailable extends Error {}

const cache = new Map<string, { at: number; data: any }>();
const STALE_LIMIT_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 4000;
// LOJA_CACHE_MS=0 desliga o cache (usado nos testes).
const ttl = (ms: number) => (process.env.LOJA_CACHE_MS !== undefined ? Number(process.env.LOJA_CACHE_MS) : ms);

async function request(path: string, init: RequestInit = {}) {
  try {
    return await fetch(API_URL + path, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new ApiUnavailable('API sem resposta');
  }
}

async function getCached(path: string, ttlMs: number) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < ttl(ttlMs)) return hit.data;
  try {
    const res = await request(path);
    if (res.status === 404) { cache.set(path, { at: Date.now(), data: null }); return null; }
    if (!res.ok) throw new ApiUnavailable(`API respondeu ${res.status}`);
    const data = await res.json();
    cache.set(path, { at: Date.now(), data });
    return data;
  } catch (error) {
    if (hit && hit.data !== null && Date.now() - hit.at < STALE_LIMIT_MS) return hit.data;
    throw error;
  }
}

export const getSettings = () => getCached('/api/settings/public', 30_000);

/** Todos os veículos publicados (a API devolve no máximo 200 por chamada). */
export async function getVehicles(): Promise<any[]> {
  const cached = cache.get('vehicles:all');
  if (cached && Date.now() - cached.at < ttl(15_000)) return cached.data;
  try {
    const all: any[] = [];
    for (let offset = 0; offset < 1000; offset += 200) {
      const res = await request(`/api/vehicles?limit=200&offset=${offset}`);
      if (!res.ok) throw new ApiUnavailable(`API respondeu ${res.status}`);
      const page = await res.json();
      all.push(...page);
      if (page.length < 200) break;
    }
    cache.set('vehicles:all', { at: Date.now(), data: all });
    return all;
  } catch (error) {
    if (cached && Date.now() - cached.at < STALE_LIMIT_MS) return cached.data;
    throw error;
  }
}

export const getVehicle = (slug: string) => /^[\w-]{1,120}$/.test(slug) ? getCached(`/api/vehicles/${slug}`, 10_000) : Promise.resolve(null);

/** Envio ao servidor da loja, repassando o IP do visitante (o limite de envios é por IP). */
export async function postApi(path: string, body: unknown, forwardedFor?: string, extraHeaders: Record<string, string> = {}) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}), ...extraHeaders },
    body: JSON.stringify(body)
  });
}
