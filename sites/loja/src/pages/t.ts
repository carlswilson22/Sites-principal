import type { APIRoute } from 'astro';
import { postApi } from '../lib/api';
import { isBot, sameOrigin, visitorIp } from '../lib/security';

/** Contagem de cliques no WhatsApp (sem cookie, sem dado pessoal). */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request) || isBot(request)) return new Response(null, { status: 204 });
  try {
    const body = await request.json();
    if (body?.type === 'whatsapp_click') {
      const vehicle = Number(body.vehicle_id);
      await postApi('/api/track', { type: 'whatsapp_click', page: 'whatsapp', ...(Number.isInteger(vehicle) && vehicle > 0 ? { vehicle_id: vehicle } : {}) }, visitorIp(request, clientAddress));
    }
  } catch { /* contagem é opcional: nunca atrapalha a visita */ }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
