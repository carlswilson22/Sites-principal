import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, postApi, redirect, sameOrigin, visitorIp } from '../../lib/forms';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  const response = await postApi('/api/auth/recover', { email: String(form.get('email') || '') }, visitorIp(request, clientAddress));
  // A API responde igual exista ou não a conta; o site também.
  return redirect('/esqueci-senha', [flashCookie(response.ok ? 'Se o e-mail estiver cadastrado, enviamos as instruções para criar uma nova senha.' : await apiMessage(response), response.ok ? 'ok' : 'erro')]);
};
