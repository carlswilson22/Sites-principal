import { useState, useEffect } from 'react';

const STORAGE_KEY = 'drivenow_favorites_v1';

export function useFavorites(allVehicles = []) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [1, 2]; // Default 2 favoritos para demonstração imediata
    } catch {
      return [1, 2];
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
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const isFavorite = (vehicleId) => favoriteIds.includes(vehicleId);

  const favoriteVehicles = allVehicles.filter(v => favoriteIds.includes(v.id));

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    favoritesCount: favoriteIds.length,
    favoriteVehicles
  };
}
