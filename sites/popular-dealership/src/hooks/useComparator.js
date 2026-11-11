import { useState } from 'react';

import { selectedVehicles } from '../utils/vehicleSelection';

export function useComparator(allVehicles = []) {
  const [comparedIds, setComparedIds] = useState(['1', '2']);

  const toggleCompare = (vehicleId) => {
    setComparedIds(prev => {
      const available = selectedVehicles(prev, allVehicles).map(vehicle => String(vehicle.id));
      if (available.includes(String(vehicleId))) {
        return available.filter(id => id !== String(vehicleId));
      }
      if (available.length >= 3) {
        alert('Você pode comparar no máximo 3 veículos simultaneamente.');
        return available;
      }
      return [...available, String(vehicleId)];
    });
  };

  const isComparing = (vehicleId) => comparedIds.includes(String(vehicleId));

  const clearCompared = () => setComparedIds([]);

  const comparedVehicles = selectedVehicles(comparedIds, allVehicles);

  return {
    comparedIds,
    toggleCompare,
    isComparing,
    clearCompared,
    comparedCount: comparedVehicles.length,
    comparedVehicles
  };
}
