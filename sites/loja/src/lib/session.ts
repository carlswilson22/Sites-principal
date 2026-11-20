/**
 * Conta do cliente do site. O navegador só conversa com o site; o site repassa o cookie de sessão para a API da loja
 * e devolve ao navegador o cookie que a API criou (HttpOnly, sem acesso por JavaScript).
 */
import { API_URL, SITE_URL } from './config';

export const SESSION_COOKIE = 'customer_session';
const TOKEN = /^[\w-]{16,200}$/;

/** "customer_session=<token>" a partir do cabeçalho Cookie do navegador, ou null. */
export function sessionPair(request: Request): string | null {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === SESSION_COOKIE) {
      const value = part.slice(index + 1).trim();
      return TOKEN.test(value) ? `${SESSION_COOKIE}=${value}` : null;
    }
  }
  return null;
}

export async function currentCustomer(request: Request): Promise<{ id: number; name: string; email: string } | null> {
  const pair = sessionPair(request);
  if (!pair) return null;
  try {
    const response = await fetch(`${API_URL}/api/customers/me`, { headers: { Cookie: pair }, signal: AbortSignal.timeout(3000) });
    return response.ok ? (await response.json()).customer || null : null;
  } catch {
    return null;
  }
}

/** Chamada à API em nome do cliente logado. */
export function apiAsCustomer(path: string, request: Request, init: RequestInit = {}) {
  const pair = sessionPair(request);
  return fetch(API_URL + path, {
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), ...(pair ? { Cookie: pair } : {}) },
    signal: AbortSignal.timeout(4000)
  });
}

/** Cookie de sessão que a API acabou de criar (ou apagou), reescrito para o navegador. */
export function browserSessionCookie(apiResponse: Response): string | null {
  const raw = apiResponse.headers.getSetCookie?.().find(line => line.startsWith(`${SESSION_COOKIE}=`));
  if (!raw) return null;
  const value = raw.slice(SESSION_COOKIE.length + 1).split(';')[0];
  const maxAge = /Max-Age=(\d+)/i.exec(raw)?.[1] ?? '604800';
  if (value !== '' && !TOKEN.test(value)) return null;
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${SITE_URL.startsWith('https') ? '; Secure' : ''}`;
}

export const clearedSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${SITE_URL.startsWith('https') ? '; Secure' : ''}`;
