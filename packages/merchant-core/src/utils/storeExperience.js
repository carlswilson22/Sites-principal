
export const hasVehicle360 = dealership => dealership?.features?.vehicle360 === true;

export function vehicleCardFacts(vehicle = {}) {
  return [
    { label: 'Combustível', value: vehicle.combustivel || vehicle.fuel || 'Não informado' },
    { label: 'Motor', value: vehicle.motor || vehicle.engine || 'Não informado' },
    { label: 'Potência', value: vehicle.potencia || vehicle.power || 'Não informado' },
  ];
}
