/**
 * packages/merchant-core/src/context/TierContext.jsx
 * Contexto e hook de controle de Nível da Loja (Tier Gate).
 */
import React, { createContext, useContext, useMemo } from 'react';

const TierContext = createContext(null);

export function TierProvider({ tier = 1, children }) {
  const normalizedTier = useMemo(() => {
    const t = parseInt(tier, 10);
    return [1, 2, 3].includes(t) ? t : 1;
  }, [tier]);

  const value = useMemo(() => ({
    tier: normalizedTier,
    tierName: normalizedTier === 1 ? 'Tier 1 • Essential' : normalizedTier === 2 ? 'Tier 2 • Pro' : 'Tier 3 • Enterprise',
    isAllowed: (requiredTier) => normalizedTier >= requiredTier
  }), [normalizedTier]);

  return (
    <TierContext.Provider value={value}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error('useTier deve ser utilizado dentro de um TierProvider.');
  }
  return context;
}

