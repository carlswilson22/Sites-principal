import { isStaffUser } from '../services/demoConfig.js';

export const customerPages = { simulador: 'Entre para simular o financiamento.', troca: 'Entre para avaliar seu veículo na troca.', favoritos: 'Entre para reunir seus veículos favoritos.' };
export function canAccessSitePage(page, user) {
  if (page === 'painel-lojista') return isStaffUser(user);
  return !Object.hasOwn(customerPages, page) || user?.role === 'cliente' || isStaffUser(user);
}
