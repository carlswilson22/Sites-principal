import React from 'react';
import { useStoreAccess } from '../../context/StoreAccessContext';
import { storeSync } from '../../services/storeSync';
import { submitFinancingLead } from '../../services/financingLead';
import { FinancingCalculator } from './FinancingCalculator';

export function PublicFinancingCalculator({ vehicles = [], preselectedVehicle, dealership, storeKey, lockedVehicle = false }) {
  const { user } = useStoreAccess();
  if (!vehicles.length) return <p className="text-sm text-slate-400">Não há veículos disponíveis para simulação no momento.</p>;
  return <FinancingCalculator vehicles={vehicles} preselectedVehicle={preselectedVehicle} dealership={dealership}
    storeKey={storeKey} lockedVehicle={lockedVehicle} showBanks showContact={false} customer={user}
    onSubmitSimulation={details => submitFinancingLead(storeKey, details)} localDemo={!storeSync.isRemote} />;
}
