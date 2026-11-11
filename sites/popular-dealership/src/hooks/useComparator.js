import { useState } from 'react';
import { useStoreAccess } from '../../../../packages/merchant-core/src/context/StoreAccessContext';
import { selectedVehicles } from '../utils/vehicleSelection';

const accountKey = user => user ? `${user.role}:${user.id}` : null;
export function useComparator(allVehicles = []) {
  const { user, requireLogin } = useStoreAccess();
  const key = accountKey(user);
  const [selection, setSelection] = useState({ key: null, ids: [], notice: '' });
  const comparedIds = key && selection.key === key ? selection.ids : [];
  const toggleCompare = vehicleId => requireLogin(account => {
    const currentKey = accountKey(account);
    setSelection(previous => {
      const available = selectedVehicles(previous.key === currentKey ? previous.ids : [], allVehicles).map(vehicle => String(vehicle.id));
      const id = String(vehicleId);
      const ids = available.includes(id) ? available.filter(value => value !== id) : available.length < 3 ? [...available, id] : available;
      return { key: currentKey, ids, notice: !available.includes(id) && available.length >= 3 ? 'Você pode comparar até 3 veículos. Remova uma escolha para adicionar outra.' : '' };
    });
  }, 'Entre para comparar os veículos que você escolher.');
  const comparedVehicles = selectedVehicles(comparedIds, allVehicles);
  return { comparedIds, toggleCompare, isComparing: id => comparedIds.includes(String(id)), clearCompared: () => setSelection({ key, ids: [], notice: '' }), comparedCount: comparedVehicles.length, comparedVehicles, comparisonNotice: key && selection.key === key ? selection.notice : '' };
}
