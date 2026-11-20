import { defineMiddleware } from 'astro:middleware';
import { ApiUnavailable, getSettings } from './lib/api';
import { currentCustomer, sessionPair } from './lib/session';

const CSP = "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const UNAVAILABLE = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Voltamos já</title><body style="font-family:system-ui,sans-serif;max-width:34rem;margin:15vh auto;padding:0 1.25rem;line-height:1.5">
<h1>Estamos ajustando o site</h1><p>O estoque não carregou agora. Tente de novo em alguns instantes.</p></body></html>`;

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;
  try {
    context.locals.customer = null;
    const hasSession = Boolean(sessionPair(context.request));
    const hasFlash = /(?:^|;\s*)(?:flash|comparar)=/.test(context.request.headers.get('cookie') || '');
    const loggedIn = hasSession || hasFlash; // qualquer um dos dois torna a página pessoal: nunca em cache compartilhado
    if (!path.startsWith('/media/')) {
      context.locals.settings = await getSettings();
      if (hasSession && (context.locals.settings.modules || []).includes('customers')) context.locals.customer = await currentCustomer(context.request);
    }
    const response = await next();
    response.headers.set('Content-Security-Policy', CSP);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Página de quem está logado nunca vai para cache compartilhado.
    if (loggedIn) response.headers.set('Cache-Control', 'private, no-store');
    else if (!response.headers.has('Cache-Control')) response.headers.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=60');
    response.headers.append('Vary', 'Cookie');
    return response;
  } catch (error) {
    if (error instanceof ApiUnavailable) {
      return new Response(UNAVAILABLE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '30', 'Cache-Control': 'no-store' } });
    }
    throw error;
  }
});
