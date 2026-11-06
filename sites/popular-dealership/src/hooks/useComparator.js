import { useState } from 'react';

export function useComparator(allVehicles = []) {
  const [comparedIds, setComparedIds] = useState([1, 2]); // Inicialmente com 2 veículos selecionados para testar

  const toggleCompare = (vehicleId) => {
    setComparedIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      }
      if (prev.length >= 3) {
        alert('Você pode comparar no máximo 3 veículos simultaneamente.');
        return prev;
      }
      return [...prev, vehicleId];
    });
  };

  const isComparing = (vehicleId) => comparedIds.includes(vehicleId);

  const clearCompared = () => setComparedIds([]);

  const comparedVehicles = allVehicles.filter(v => comparedIds.includes(v.id));

  return {
    comparedIds,
    toggleCompare,
    isComparing,
    clearCompared,
    comparedCount: comparedIds.length,
    comparedVehicles
  };
}
