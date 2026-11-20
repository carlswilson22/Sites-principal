/**
 * packages/merchant-core/src/services/remote.js
 * Modo real: o front conversa com o servidor da loja em vez de guardar tudo no navegador.
 *
 * - Demonstração (VITE_MERCHANT_DEMO=true, o padrão dos protótipos publicados): nada daqui é usado.
 * - Modo real (VITE_MERCHANT_DEMO=false): estoque, contatos, contas e configurações vêm do servidor.
 *
 * Endereço da API: VITE_API_URL, se definido; em desenvolvimento local (localhost) http://localhost:3001;
 * em produção, o mesmo domínio do site ("/api" e "/media", repassados pelo proxy da hospedagem).
 */
import { isDemoMode } from './demoConfig.js';

// Modo real só com VITE_MERCHANT_DEMO=false explícito (sem a variável, como nos testes em Node, o armazenamento local continua).
export const isRemote = !isDemoMode && import.meta.env?.VITE_MERCHANT_DEMO === 'false';

const configured = String(import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
export const API_ORIGIN = configured || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** Fotos vêm do servidor como "/media/..."; o front pode estar em outro endereço. */
export const mediaUrl = url => (typeof url === 'string' && url.startsWith('/media/') ? `${API_ORIGIN}${url}` : url);
/** Volta ao caminho "/media/..." (para comparar com o que o servidor guardou). */
export const mediaPath = url => (typeof url === 'string' && API_ORIGIN && url.startsWith(`${API_ORIGIN}/media/`) ? url.slice(API_ORIGIN.length) : url);

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

/** Chamada à API com cookie de sessão. Devolve os dados; erro de rede ou de resposta vira ApiError com texto amigável. */
export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method, credentials: 'include',
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor da loja. Verifique a internet e tente de novo.', 0);
  }
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const fallback = response.status === 401 ? 'Sua sessão expirou. Entre de novo.' : response.status === 403 ? 'Você não tem permissão para esta ação.' : response.status === 429 ? 'Muitas tentativas. Aguarde um pouco e tente de novo.' : 'Não foi possível concluir agora. Tente de novo em instantes.';
    throw new ApiError(typeof data?.error === 'string' ? data.error : fallback, response.status);
  }
  return data;
}
