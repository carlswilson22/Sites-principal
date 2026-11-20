import { defineMiddleware } from 'astro:middleware';
import { api, ApiUnavailable } from './lib/api';
import { clearSessionCookie, readSessionToken } from './lib/forms';

const CSP = "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
const PUBLIC = ['/entrar', '/acoes/entrar', '/esqueci-senha', '/acoes/recuperar'];
const ALLOWED_WHILE_MUST_CHANGE = ['/senha', '/acoes/senha', '/acoes/sair'];

const UNAVAILABLE = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Painel indisponível</title><body style="font-family:system-ui,sans-serif;max-width:34rem;margin:15vh auto;padding:0 1.25rem;line-height:1.5">
<h1>Não foi possível falar com o servidor da loja</h1><p>Tente de novo em alguns instantes. Se persistir, avise a UP Assessoria.</p></body></html>`;

let cached: { at: number; data: any } | null = null;
async function publicSettings() {
  if (cached && Date.now() - cached.at < 30_000) return cached.data;
  const result = await api('', 'GET', '/api/settings/public');
  if (!result.ok) throw new ApiUnavailable('configuração indisponível');
  cached = { at: Date.now(), data: result.data };
  return result.data;
}

const redirectTo = (to: string, headers: Record<string, string> = {}) => new Response(null, { status: 302, headers: { Location: to, 'Cache-Control': 'no-store', ...headers } });

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;
  context.locals.user = null;
  context.locals.token = '';
  try {
    context.locals.settings = await publicSettings();
    const token = readSessionToken(context.request);
    let clear = false;
    if (token && path !== '/entrar') {
      const me = await api(token, 'GET', '/api/auth/me');
      if (me.ok) { context.locals.user = me.data.user; context.locals.token = token; } else clear = true;
    }

    if (path === '/acoes/foto' && !context.locals.user) return Response.json({ ok: false, error: 'Sessão expirada. Entre de novo.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    if (!PUBLIC.includes(path) && !context.locals.user) {
      return redirectTo('/entrar', clear ? { 'Set-Cookie': clearSessionCookie() } : {});
    }
    if (context.locals.user?.mustChangePassword && !ALLOWED_WHILE_MUST_CHANGE.includes(path) && !path.startsWith('/media/')) return redirectTo('/senha');

    const response = await next();
    response.headers.set('Content-Security-Policy', CSP);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    if (!path.startsWith('/media/')) response.headers.set('Cache-Control', 'private, no-store');
    if (clear) response.headers.append('Set-Cookie', clearSessionCookie());
    return response;
  } catch (error) {
    if (error instanceof ApiUnavailable) return new Response(UNAVAILABLE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '30', 'Cache-Control': 'no-store' } });
    throw error;
  }
});
