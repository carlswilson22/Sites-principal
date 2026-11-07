/**
 * packages/merchant-core/src/components/common/TierGate.jsx
 * Barreira visual de segurança: Renderiza o conteúdo apenas se a loja possuir o nível requerido.
 */
import React from 'react';
import { useTier } from '../../context/TierContext';

export function TierGate({ requiredTier, children, fallback = null }) {
  const { isAllowed } = useTier();

  if (!isAllowed(requiredTier)) {
    return fallback;
  }

  return <>{children}</>;
}
