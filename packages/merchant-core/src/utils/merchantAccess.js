export const merchantPermissions = {
  dashboard: { tier: 1 }, inventory: { tier: 1 }, leads: { tier: 1 },
  financing: { tier: 1, roles: ['gerente', 'atendente'] },
  clients: { tier: 2 }, fipe: { tier: 2 },
  contracts: { tier: 1, roles: ['gerente', 'atendente'] },
  financial: { tier: 2, roles: [] }, analytics: { tier: 2, roles: ['gerente'] },
  consignments: { tier: 3, roles: ['gerente'] }, contracts_adv: { tier: 3, roles: ['gerente'] },
  financial_full: { tier: 3, roles: [] }, market_pricing: { tier: 3 },
  funnel: { tier: 3, roles: ['gerente'] }, stories: { tier: 3 }, audit_lgpd: { tier: 3, roles: [] },
};

export function canAccessMerchantRoute(routeId, tier, role) {
  const route = merchantPermissions[routeId];
  return Boolean(route && ['proprietario', 'gerente', 'atendente'].includes(role) && tier >= route.tier
    && (role === 'proprietario' || !route.roles || route.roles.includes(role)));
}
