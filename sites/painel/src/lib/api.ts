/** Acesso à API da loja em nome da pessoa logada (a sessão do painel guarda o token da API). */
import { API_URL } from './config';

export class ApiUnavailable extends Error {}
export interface ApiResult<T = any> { ok: boolean; status: number; data: T }

export async function api<T = any>(token: string, method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(API_URL + path, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...extraHeaders },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000)
    });
    const text = await response.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    return { ok: response.ok, status: response.status, data };
  } catch {
    throw new ApiUnavailable('API sem resposta');
  }
}

/** Mensagem amigável a partir da resposta de erro da API. */
export function errorText(result: ApiResult): string {
  if (typeof result.data?.error === 'string') return result.data.error.slice(0, 300);
  if (result.status === 403) return 'Você não tem permissão para esta ação.';
  if (result.status === 404) return 'Não encontramos o que você procurou.';
  if (result.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  return 'Não foi possível concluir agora. Tente de novo em instantes.';
}
