import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, postApi, redirect, sameOrigin, visitorIp } from '../lib/forms';

/** Troca Fácil: registra o usado do cliente para a loja avaliar. Não calcula nem promete valor. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > 20_000) return new Response('Envio grande demais.', { status: 413 });
  const form = await request.formData();
  const field = (name: string) => String(form.get(name) ?? '').trim();
  if (field('site')) return redirect('/servicos?enviado=troca#troca'); // robô

  const interest = Number(field('interest_vehicle_id'));
  const km = field('km') ? Number(field('km').replace(/\D/g, '')) : undefined;
  const response = await postApi('/api/trade-ins', {
    name: field('name'), phone: field('phone'), email: field('email') || undefined, notes: field('notes') || undefined,
    vehicle: { brand: field('brand') || undefined, model: field('model'), year: field('year'), ...(km ? { km } : {}) },
    ...(Number.isInteger(interest) && interest > 0 ? { interest_vehicle_id: interest } : {}),
    consent: form.get('consent') === 'on'
  }, visitorIp(request, clientAddress));
  if (response.status === 201) return redirect('/servicos?enviado=troca#troca');
  return redirect('/servicos#troca', [flashCookie(await apiMessage(response))]);
};
