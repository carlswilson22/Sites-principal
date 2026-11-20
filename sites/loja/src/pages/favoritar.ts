import type { APIRoute } from 'astro';
import { apiMessage, flashCookie, redirect, safeBackPath, sameOrigin } from '../lib/forms';
import { apiAsCustomer, currentCustomer } from '../lib/session';

/** Salvar ou remover um veículo dos favoritos. Sem login, leva à entrada e volta para o mesmo carro. */
export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const form = await request.formData();
  const back = safeBackPath(form.get('voltar'), '/favoritos');
  const vehicleId = Number(form.get('vehicle_id'));
  const remove = form.get('acao') === 'remover';
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) return redirect(back);

  if (!(await currentCustomer(request))) {
    return redirect(`/conta/entrar?voltar=${encodeURIComponent(back)}`, [flashCookie('Entre ou crie uma conta para salvar seus favoritos.', 'ok')]);
  }
  try {
    const response = await apiAsCustomer(`/api/customers/favorites/${vehicleId}`, request, { method: remove ? 'DELETE' : 'PUT' });
    if (!response.ok) return redirect(back, [flashCookie(await apiMessage(response))]);
  } catch {
    return redirect(back, [flashCookie('Não foi possível salvar agora. Tente de novo.')]);
  }
  return redirect(back);
};
