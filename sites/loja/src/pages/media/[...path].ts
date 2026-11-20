import type { APIRoute } from 'astro';
import { API_URL } from '../../lib/config';

const VALID = /^vehicles\/\d+\/[a-f0-9-]{36}\.(jpg|png|webp)$/;

/** Fotos: o site as busca na API da loja e as entrega no próprio endereço (um domínio só, sem CORS). */
export const GET: APIRoute = async ({ params }) => {
  const path = String(params.path || '');
  if (!VALID.test(path)) return new Response('Não encontrado', { status: 404 });
  try {
    const upstream = await fetch(`${API_URL}/media/${path}`, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok || !upstream.body) return new Response('Não encontrado', { status: 404 });
    return new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    return new Response('Indisponível', { status: 503, headers: { 'Retry-After': '30' } });
  }
};
