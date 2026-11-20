export function normalizeSelectionIds(value, fallback = []) {
  const list = Array.isArray(value) ? value : fallback;
  return [...new Set(list.filter(id => (typeof id === 'number' && Number.isFinite(id)) || (typeof id === 'string' && id.trim())).map(String))];
}

export function selectedVehicles(ids, vehicles) {
  const selected = new Set(normalizeSelectionIds(ids));
  return vehicles.filter(vehicle => selected.has(String(vehicle.id)));
}
