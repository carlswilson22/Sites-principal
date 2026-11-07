/**
 * server/src/middlewares/tierGate.js
 * Barreira de Segurança por Nível do Modelo (Tier Gate).
 * Garante que endpoints de níveis superiores NÃO existam ou sejam bloqueados nos modelos inferiores.
 *
 * Configuração:
 * MERCHANT_TIER = 1 (Básico: E1-E6)
 * MERCHANT_TIER = 2 (Intermediário: E1-E6 + I1-I8)
 * MERCHANT_TIER = 3 (Completo: E1-E6 + I1-I8 + A1-A8)
 */

export function getStoreTier() {
  const configured = parseInt(process.env.MERCHANT_TIER || '1', 10);
  if ([1, 2, 3].includes(configured)) return configured;
  return 1;
}

/**
 * Valida se a requisição é permitida no Tier atual da loja.
 * Se o tier da loja for menor que o tier requerido, retorna 404 (endpoint não existe neste modelo).
 * 
 * @param {number} requiredTier 
 * @param {number} currentTier 
 * @returns {{ allowed: boolean, status?: number, error?: string }}
 */
export function assertTier(requiredTier, currentTier = getStoreTier()) {
  if (currentTier >= requiredTier) {
    return { allowed: true };
  }

  return {
    allowed: false,
    status: 404,
    error: `Recurso não encontrado neste modelo (Requer Nível ${requiredTier}, Loja configurada no Nível ${currentTier}).`
  };
}
