import { normalizeSelectionIds } from './vehicleSelection.js';
import { isPublishedVehicle } from '../../../../packages/merchant-core/src/utils/vehicles.js';

export function comparisonSelection(ids, vehicles) {
  const available = new Set(vehicles.filter(isPublishedVehicle).map(vehicle => String(vehicle.id)));
  return normalizeSelectionIds(ids).filter(id => available.has(id)).slice(0, 3);
}
export function comparisonNumber(value, allowZero = false) {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && (allowZero ? number >= 0 : number > 0) ? number : null;
}
export function vehicleModelYear(vehicle) {
  const years = String(vehicle.ano ?? vehicle.year ?? '').match(/\b(?:19|20)\d{2}\b/g);
  return years?.length ? Number(years.at(-1)) : null;
}
export function comparisonSummary(vehicles) {
  const rank = (getValue, direction = 'min') => {
    const values = vehicles.map(getValue);
    if (vehicles.length < 2 || values.some(value => value === null)) return null;
    const best = Math[direction](...values);
    return { value: best, vehicles: vehicles.filter((_, index) => values[index] === best), tied: values.filter(value => value === best).length > 1 };
  };
  const prices = vehicles.map(vehicle => comparisonNumber(vehicle.preco ?? vehicle.price));
  return {
    price: rank(vehicle => comparisonNumber(vehicle.preco ?? vehicle.price)),
    mileage: rank(vehicle => comparisonNumber(vehicle.km, true)),
    year: rank(vehicleModelYear, 'max'),
    priceRange: prices.length >= 2 && prices.every(value => value !== null) ? Math.max(...prices) - Math.min(...prices) : null
  };
}
