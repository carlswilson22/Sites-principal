import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, postApi, redirect, sameOrigin, visitorIp } from '../../lib/forms';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  const token = String(form.get('token') || '');
  if (!/^[\w-]{16,200}$/.test(token)) return redirect('/esqueci-senha', [flashCookie('Link inválido ou expirado. Peça uma nova recuperação.')]);
  const response = await postApi('/api/auth/reset', { token, password: String(form.get('password') || '') }, visitorIp(request, clientAddress));
  if (response.ok) return redirect('/conta/entrar', [flashCookie('Senha redefinida. Entre com a nova senha. Se você é da equipe da loja, a entrada é pelo painel.', 'ok')]);
  return redirect(`/redefinir-senha?token=${token}`, [flashCookie(await apiMessage(response))]);
};
