import type { APIRoute } from 'astro';
import { postApi } from '../lib/api';
import { safeBackPath, sameOrigin, visitorIp } from '../lib/security';

const MAX_BODY = 20_000;
const MESSAGES: Record<number, string> = {
  400: 'Confira os campos: nome, telefone com DDD e o aceite do aviso de privacidade.',
  429: 'Você enviou muitas mensagens. Tente de novo mais tarde ou chame no WhatsApp.'
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return new Response('Envio grande demais.', { status: 413 });

  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const form = await request.formData();
  const field = (name: string) => String(form.get(name) ?? '').trim();
  const back = safeBackPath(field('voltar'));
  const finish = (ok: boolean, status: number, message?: string) => {
    if (wantsJson) return Response.json(ok ? { ok: true } : { ok: false, error: message }, { status: ok ? 200 : status });
    const target = new URL(back, 'http://x');
    target.searchParams.set(ok ? 'enviado' : 'erro', ok ? '1' : String(status));
    return new Response(null, { status: 303, headers: { Location: target.pathname + target.search + '#contato-form' } });
  };

  // Campo-isca: robôs preenchem, pessoas não veem. Responde como sucesso, sem registrar nada.
  if (field('site')) return finish(true, 200);

  let simulation: unknown = undefined;
  if (field('simulation')) {
    try { simulation = JSON.parse(field('simulation')); } catch { simulation = undefined; }
  }
  const vehicleId = Number(field('vehicle_id'));
  const source = field('source') === 'simulador_financiamento' && simulation ? 'simulador_financiamento' : 'site_formulario';

  const response = await postApi('/api/leads', {
    name: field('name'), phone: field('phone'), email: field('email') || undefined, message: field('message') || undefined,
    consent: form.get('consent') === 'on' || form.get('consent') === 'true', source,
    ...(Number.isInteger(vehicleId) && vehicleId > 0 ? { vehicle_id: vehicleId } : {}),
    ...(simulation ? { simulation_data: simulation } : {})
  }, visitorIp(request, clientAddress));

  if (response.status === 201) return finish(true, 200);
  const status = response.status === 429 ? 429 : response.status >= 500 ? 503 : 400;
  return finish(false, status, MESSAGES[status] || 'Não foi possível enviar agora. Chame no WhatsApp.');
};
