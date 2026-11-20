import type { APIRoute } from 'astro';
import { getSettings, getVehicle, postApi } from '../lib/api';
import { sameOrigin, visitorIp } from '../lib/security';

const MONTHS = [12, 24, 36, 48, 60];
const fail = (error: string, status = 400) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

/** Simulação de parcela: o preço vem do estoque (ou do valor informado, na página de Serviços) e a taxa, das condições cadastradas pela loja (nunca do navegador). */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) return fail('Origem não permitida.', 403);
  let body: any;
  try { body = await request.json(); } catch { return fail('Pedido inválido.'); }

  const settings = await getSettings();
  const rates = settings?.simulator?.rates || [];
  // Com veículo: o preço vem do estoque. Sem veículo (página de Serviços): o cliente informa um valor para simular.
  let price: number;
  if (body.slug) {
    const vehicle = await getVehicle(String(body.slug));
    if (!vehicle) return fail('Veículo não encontrado.', 404);
    price = vehicle.price;
  } else {
    price = Number(body.price);
    if (!Number.isFinite(price) || price < 1000 || price > 10_000_000) return fail('Informe o valor do veículo (de R$ 1.000 a R$ 10.000.000).');
  }
  const rate = rates[Number.isInteger(body.rate) ? body.rate : 0];
  const down = Number(body.down);
  if (!rate) return fail('A loja ainda não cadastrou as condições de financiamento.');
  if (!MONTHS.includes(body.months)) return fail('Escolha um prazo de 12 a 60 meses.');
  if (!Number.isFinite(down) || down < 0 || down >= price) return fail('A entrada precisa ser menor que o preço do veículo.');

  const response = await postApi('/api/financing/calculate', {
    vehiclePrice: price, downPayment: down, months: body.months, monthlyInterestRate: rate.monthlyRatePercent
  }, visitorIp(request, clientAddress));
  if (!response.ok) return fail('Não foi possível calcular agora.', 503);
  const result = await response.json();
  return Response.json({
    installment: result.installmentValue, months: result.months, down, ratePercent: rate.monthlyRatePercent, rateName: rate.name
  }, { headers: { 'Cache-Control': 'no-store' } });
};
