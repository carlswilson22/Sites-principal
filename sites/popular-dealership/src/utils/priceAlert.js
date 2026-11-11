import { validateStoreRequest } from '../../../../packages/merchant-core/src/utils/concierge.js';

export function validatePriceAlert(form, vehiclePrice) {
  const contact = validateStoreRequest(form);
  const targetPrice = Number(form.targetPrice);
  if (!Number.isFinite(targetPrice) || targetPrice <= 0 || !Number.isFinite(Number(vehiclePrice)) || targetPrice > Number(vehiclePrice)) {
    throw new Error('Informe um preço desejado maior que zero e até o valor anunciado.');
  }
  return { ...contact, targetPrice: Math.round(targetPrice * 100) / 100 };
}
