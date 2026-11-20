import type { APIRoute } from 'astro';
import { getSettings, getVehicles } from '../lib/api';
import { SITE_URL } from '../lib/config';

const escape = (text: string) => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));

/** Lista de endereços para o Google. Veículo vendido deixa de aparecer na hora em que sai do estoque. */
export const GET: APIRoute = async ({ url }) => {
  const origin = SITE_URL || url.origin;
  const vehicles = await getVehicles();
  const modules: string[] = (await getSettings())?.modules || [];
  const paths = ['/', '/estoque', '/contato', '/privacidade', ...(modules.includes('services') ? ['/servicos'] : []), ...(modules.includes('virtual_consultant') ? ['/consultor'] : []), ...vehicles.map(v => `/veiculo/${v.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${escape(origin + p)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
};
