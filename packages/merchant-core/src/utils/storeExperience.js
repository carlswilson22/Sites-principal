import { isPublishedVehicle } from './vehicles.js';

export const hasVehicle360 = dealership => dealership?.features?.vehicle360 === true;

export function vehicleCardFacts(vehicle = {}) {
  return [
    { label: 'Combustível', value: vehicle.combustivel || vehicle.fuel || 'Não informado' },
    { label: 'Motor', value: vehicle.motor || vehicle.engine || 'Não informado' },
    { label: 'Potência', value: vehicle.potencia || vehicle.power || 'Não informado' },
  ];
}

export function storeHighlights(dealership, vehicles = []) {
  return [
    { id: 'deliveries', label: 'Carros entregues com sucesso', value: dealership.homeHighlights?.deliveries || 'Consulte a loja' },
    { id: 'inspection', label: 'Veículos periciados', value: dealership.homeHighlights?.inspection || 'Consulte a loja' },
    { id: 'credit', label: 'Pré-análise de crédito', value: 'Sob análise' },
    { id: 'inventory', label: 'Veículos disponíveis', value: String(vehicles.filter(isPublishedVehicle).length) },
  ];
}
