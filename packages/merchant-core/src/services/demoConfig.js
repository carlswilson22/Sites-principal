// Explicit build configuration: API failures never enable demonstration access.
export const isDemoMode = import.meta.env?.VITE_MERCHANT_DEMO === 'true';
export const demoRoles = ['proprietario', 'gerente', 'atendente'];
export function createDemoUser(email, password) {
  const role = String(email).split('@')[0];
  if (!demoRoles.includes(role) || email !== `${role}@demo.invalid` || password !== 'Demonstracao@2026') {
    throw new Error('Use um dos acessos demonstrativos apresentados abaixo.');
  }
  return { id: demoRoles.indexOf(role) + 1, name: `Perfil demonstrativo: ${role}`, email, role, demo: true };
}
