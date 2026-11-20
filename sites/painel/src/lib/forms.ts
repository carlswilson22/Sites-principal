import { PANEL_URL, SESSION_COOKIE } from './config';

/** Formulários só valem se vierem do próprio painel. */
export function sameOrigin(request: Request): boolean {
  const expectedHost = PANEL_URL ? new URL(PANEL_URL).host : (request.headers.get('x-forwarded-host') || request.headers.get('host') || '');
  const source = request.headers.get('origin') || request.headers.get('referer');
  if (!source) return false;
  try { return new URL(source).host === expectedHost; } catch { return false; }
}

/** Só aceita caminhos internos como destino de redirecionamento. */
export function safeBack(value: unknown, fallback = '/'): string {
  const path = String(value || '');
  return /^\/(?!\/)[\w\-./?=&%#]*$/.test(path) ? path : fallback;
}

const secure = () => (PANEL_URL.startsWith('https') ? '; Secure' : '');
export const sessionCookie = (token: string) => `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure()}`;
export const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure()}`;

export function readSessionToken(request: Request): string {
  const match = new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([\\w-]{16,200})`).exec(request.headers.get('cookie') || '');
  return match ? match[1] : '';
}

/** Mensagem de uma só leitura, por cookie curto (nada que venha da URL aparece na tela). */
export const flashCookie = (message: string, kind: 'ok' | 'erro' = 'erro') =>
  `flash=${encodeURIComponent(`${kind}|${message}`)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`;

export function readFlash(request: Request): { kind: 'ok' | 'erro'; message: string } | null {
  const match = /(?:^|;\s*)flash=([^;]*)/.exec(request.headers.get('cookie') || '');
  if (!match) return null;
  try {
    const [kind, ...rest] = decodeURIComponent(match[1]).split('|');
    return kind === 'ok' || kind === 'erro' ? { kind, message: rest.join('|').slice(0, 400) } : null;
  } catch { return null; }
}

export function redirect(to: string, cookies: string[] = []) {
  const headers = new Headers({ Location: to, 'Cache-Control': 'no-store' });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

/** "89.900,00", "R$ 89900", "42.000" -> número; vazio -> undefined; inválido -> NaN. */
export function parseNumber(value: unknown): number | undefined {
  let text = String(value ?? '').replace(/R\$|km|cv|%/gi, '').replace(/\s/g, '');
  if (text === '') return undefined;
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : NaN;
}
