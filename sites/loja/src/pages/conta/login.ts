import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, postApi, redirect, safeBackPath, sameOrigin, visitorIp } from '../../lib/forms';
import { browserSessionCookie } from '../../lib/session';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  const back = safeBackPath(form.get('voltar'), '/');
  const here = `/conta/entrar?voltar=${encodeURIComponent(back)}`;

  const response = await postApi('/api/customers/login', { email: String(form.get('email') || ''), password: String(form.get('password') || '') }, visitorIp(request, clientAddress));
  const cookie = response.ok ? browserSessionCookie(response) : null;
  if (!response.ok || !cookie) return redirect(here, [flashCookie(response.ok ? 'Não foi possível entrar agora.' : await apiMessage(response))]);
  return redirect(back, [cookie]);
};
