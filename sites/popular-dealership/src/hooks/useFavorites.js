import { useEffect, useState } from 'react';
import { useStoreAccess } from '../../../../packages/merchant-core/src/context/StoreAccessContext';
import { normalizeSelectionIds, selectedVehicles } from '../utils/vehicleSelection';

const accountKey = (storeKey, user) => user ? `customer_favorites_${storeKey}_${user.role}_${user.id}` : null;
function readIds(key) {
  try { return key ? normalizeSelectionIds(JSON.parse(localStorage.getItem(key) || '[]')) : []; }
  catch { return []; }
}

export function useFavorites(allVehicles = []) {
  const { user, storeKey, requireLogin } = useStoreAccess();
  const key = accountKey(storeKey, user);
  const [selection, setSelection] = useState(() => ({ key, ids: readIds(key) }));
  useEffect(() => { setSelection({ key, ids: readIds(key) }); }, [key]);
  const favoriteIds = key && selection.key === key ? selection.ids : [];
  const toggleFavorite = vehicleId => requireLogin(account => {
    const currentKey = accountKey(storeKey, account);
    setSelection(previous => {
      const ids = previous.key === currentKey ? previous.ids : readIds(currentKey);
      const next = ids.includes(String(vehicleId)) ? ids.filter(id => id !== String(vehicleId)) : [...ids, String(vehicleId)];
      try { localStorage.setItem(currentKey, JSON.stringify(next)); } catch {}
      return { key: currentKey, ids: next };
    });
  }, 'Entre para salvar este veículo nos seus favoritos.');
  const favoriteVehicles = selectedVehicles(favoriteIds, allVehicles);
  return { favoriteIds, toggleFavorite, isFavorite: id => favoriteIds.includes(String(id)), favoritesCount: favoriteVehicles.length, favoriteVehicles };
}
