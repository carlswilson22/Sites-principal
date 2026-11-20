import { SITE_URL } from './config';

/** Formulários só valem se vierem do próprio site (proteção contra envio por páginas de terceiros). */
export function sameOrigin(request: Request): boolean {
  const expectedHost = SITE_URL ? new URL(SITE_URL).host : (request.headers.get('x-forwarded-host') || request.headers.get('host') || '');
  const source = request.headers.get('origin') || request.headers.get('referer');
  if (!source) return false;
  try { return new URL(source).host === expectedHost; } catch { return false; }
}

/** IP do visitante, como o proxy informou. Sem proxy, o do próprio socket. */
export function visitorIp(request: Request, clientAddress?: string): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress;
}

/** Só aceita caminhos internos como destino de redirecionamento. */
export function safeBackPath(value: unknown, fallback = '/'): string {
  const path = String(value || '');
  return /^\/(?!\/)[\w\-./?=&%]*$/.test(path) ? path : fallback;
}

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|uptime|lighthouse|headless/i;
export const isBot = (request: Request) => BOT.test(request.headers.get('user-agent') || '');
