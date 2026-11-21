import { storeSync } from './storeSync';

export async function submitFinancingLead(storeKey, { vehicle, ...details }) {
  if (!vehicle?.id) throw new Error('Selecione um veículo para enviar a simulação.');
  await storeSync.addLead(storeKey, {
    ...details, vehicle_id: vehicle.id, vehicle_title: vehicle.nome || vehicle.title,
    vehicle_price: vehicle.preco ?? vehicle.price, source: 'simulador_financiamento',
    message: 'Cliente enviou uma simulação de financiamento.'
  });
}
