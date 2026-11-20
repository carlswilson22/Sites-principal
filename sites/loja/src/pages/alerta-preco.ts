import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, redirect, safeBackPath, sameOrigin } from '../lib/forms';
import { apiAsCustomer, currentCustomer } from '../lib/session';

/** "Quero uma condição melhor": registra um contato para a loja negociar. Não monitora preço nem avisa sozinho. */
export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  const back = safeBackPath(form.get('voltar'), '/');
  if (!(await currentCustomer(request))) {
    return redirect(`/conta/entrar?voltar=${encodeURIComponent(back)}`, [flashCookie('Entre ou crie uma conta para pedir uma condição melhor.', 'ok')]);
  }
  const body = {
    vehicle_id: Number(form.get('vehicle_id')),
    desired_price: Number(String(form.get('desired_price') || '').replace(/\./g, '').replace(',', '.')),
    consent: form.get('consent') === 'on'
  };
  try {
    const response = await apiAsCustomer('/api/price-alerts', request, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (response.status === 201) return redirect(back, [flashCookie('Pedido registrado. A loja entra em contato para negociar.', 'ok')]);
    return redirect(back, [flashCookie(await apiMessage(response))]);
  } catch {
    return redirect(back, [flashCookie('Não foi possível enviar agora. Tente de novo.')]);
  }
};
