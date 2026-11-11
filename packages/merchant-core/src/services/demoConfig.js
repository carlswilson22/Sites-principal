// Explicit build configuration: API failures never enable demonstration access.
export const isDemoMode = import.meta.env?.VITE_MERCHANT_DEMO === 'true';
export const demoRoles = ['proprietario', 'gerente', 'atendente'];
export const isStaffUser = user => demoRoles.includes(user?.role);

export function createDemoCustomer(email, password) {
  if (email !== 'cliente@demo.invalid' || password !== 'Cliente@2026') throw new Error('E-mail ou senha inválidos para o acesso de cliente.');
  return { id: 'customer-demo', name: 'Cliente de demonstração', email, role: 'cliente', demo: true };
}

export function createDemoUser(email, password) {
  const role = String(email).split('@')[0];
  if (!demoRoles.includes(role) || email !== `${role}@demo.invalid` || password !== 'Demonstracao@2026') {
    throw new Error('E-mail ou senha inválidos para o acesso da equipe.');
  }
  return { id: demoRoles.indexOf(role) + 1, name: `Perfil demonstrativo: ${role}`, email, role, demo: true };
}

export function demoSessionKey(storeKey) { return `store_access_${storeKey}`; }

export function readDemoSession(raw, storeKey, now = Date.now()) {
  try {
    const session = JSON.parse(raw);
    if (session?.storeKey !== storeKey || !Number.isFinite(session.expiresAt) || session.expiresAt <= now || session.user?.demo !== true) return null;
    const user = session.user;
    if (user.role === 'cliente' && user.email === 'cliente@demo.invalid' && user.id === 'customer-demo') return createDemoCustomer(user.email, 'Cliente@2026');
    if (isStaffUser(user) && user.email === `${user.role}@demo.invalid` && user.id === demoRoles.indexOf(user.role) + 1) return createDemoUser(user.email, 'Demonstracao@2026');
  } catch {}
  return null;
}
