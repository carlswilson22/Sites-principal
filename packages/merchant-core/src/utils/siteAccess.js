import { isStaffUser } from '../services/demoConfig.js';

export const customerPages = ['troca', 'favoritos'];
export function canAccessSitePage(page, user) {
  if (page === 'painel-lojista') return isStaffUser(user);
  return true;
}
