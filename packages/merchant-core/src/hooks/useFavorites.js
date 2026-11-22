import { useEffect, useState } from 'react';
import { useStoreAccess } from '../context/StoreAccessContext';
import { normalizeSelectionIds, selectedVehicles } from '../utils/vehicleSelection.js';

function readIds(key, legacyKey) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return normalizeSelectionIds(JSON.parse(raw));
    // Preserve os favoritos da sessão de cliente anterior ao remover a exigência de conta.
    const legacy = legacyKey && localStorage.getItem(legacyKey);
    if (!legacy) return [];
    const ids = normalizeSelectionIds(JSON.parse(legacy));
    try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* A sessão anterior continua intacta. */ }
    return ids;
  }
  catch { return []; }
}

export function useFavorites(allVehicles = []) {
  const { user, storeKey } = useStoreAccess();
  const key = `customer_favorites_${storeKey}_visitante`;
  const legacyKey = user?.role === 'cliente' ? `customer_favorites_${storeKey}_${user.role}_${user.id}` : null;
  const [selection, setSelection] = useState(() => ({ key, ids: readIds(key, legacyKey) }));
  useEffect(() => { setSelection({ key, ids: readIds(key, legacyKey) }); }, [key, legacyKey]);
  const favoriteIds = key && selection.key === key ? selection.ids : [];
  const toggleFavorite = vehicleId => {
    const currentKey = key;
    setSelection(previous => {
      const ids = previous.key === currentKey ? previous.ids : readIds(currentKey);
      const next = ids.includes(String(vehicleId)) ? ids.filter(id => id !== String(vehicleId)) : [...ids, String(vehicleId)];
      try { localStorage.setItem(currentKey, JSON.stringify(next)); } catch {}
      return { key: currentKey, ids: next };
    });
  };
  const favoriteVehicles = selectedVehicles(favoriteIds, allVehicles);
  return { favoriteIds, toggleFavorite, isFavorite: id => favoriteIds.includes(String(id)), favoritesCount: favoriteVehicles.length, favoriteVehicles };
}
