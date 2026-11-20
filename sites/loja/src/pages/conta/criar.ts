import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, postApi, redirect, safeBackPath, sameOrigin, visitorIp } from '../../lib/forms';
import { browserSessionCookie } from '../../lib/session';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  const field = (name: string) => String(form.get(name) ?? '').trim();
  const back = safeBackPath(form.get('voltar'), '/');
  const here = `/conta/entrar?voltar=${encodeURIComponent(back)}`;
  if (field('site')) return redirect(back); // campo-isca preenchido: robô

  const response = await postApi('/api/customers/register', {
    name: field('name'), email: field('email'), password: String(form.get('password') || ''), phone: field('phone') || undefined,
    consent: form.get('consent') === 'on'
  }, visitorIp(request, clientAddress));
  const cookie = response.ok ? browserSessionCookie(response) : null;
  if (!response.ok || !cookie) return redirect(here, [flashCookie(response.ok ? 'Não foi possível criar a conta agora.' : await apiMessage(response))]);
  return redirect(back, [cookie]);
};
