import type { APIRoute } from 'astro';
import { redirect, safeBackPath, sameOrigin } from '../../lib/forms';
import { apiAsCustomer, clearedSessionCookie } from '../../lib/session';

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  try { await apiAsCustomer('/api/customers/logout', request, { method: 'POST' }); } catch { /* o cookie é apagado de qualquer jeito */ }
  return redirect(safeBackPath(form.get('voltar'), '/'), [clearedSessionCookie()]);
};
