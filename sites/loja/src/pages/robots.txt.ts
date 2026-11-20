import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/config';

export const GET: APIRoute = ({ url }) => {
  const origin = SITE_URL || url.origin;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /enviar-contato\nDisallow: /simular\nDisallow: /t\n\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
};
