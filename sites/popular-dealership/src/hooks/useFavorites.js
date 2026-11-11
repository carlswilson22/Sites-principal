import { useState, useEffect } from 'react';

import { normalizeSelectionIds, selectedVehicles } from '../utils/vehicleSelection';

const STORAGE_KEY = 'apexluxury_favorites_v1';

export function useFavorites(allVehicles = []) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('drivenow_favorites_v1');
      return normalizeSelectionIds(saved ? JSON.parse(saved) : [1, 2], [1, 2]);
    } catch {
      return normalizeSelectionIds([1, 2]);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Erro ao salvar favoritos no storage:', e);
    }
  }, [favoriteIds]);

  const toggleFavorite = (vehicleId) => {
    setFavoriteIds(prev => 
      prev.includes(String(vehicleId))
        ? prev.filter(id => id !== String(vehicleId))
        : [...prev, String(vehicleId)]
    );
  };

  const isFavorite = (vehicleId) => favoriteIds.includes(String(vehicleId));

  const favoriteVehicles = selectedVehicles(favoriteIds, allVehicles);

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    favoritesCount: favoriteVehicles.length,
    favoriteVehicles
  };
}
