/**
 * server/src/middlewares/rbacMiddleware.js
 * Controle de Acesso Baseado em Perfis (RBAC):
 * - proprietario: Acesso completo (financeiro, auditoria, configurações)
 * - gerente: Acesso a estoque, leads, clientes, contratos, precificador
 * - atendente: Acesso a catálogo, seus leads e simulações (sem dados confidenciais)
 */

export function checkRole(user, allowedRoles = []) {
  if (!user || !user.role) {
    return { allowed: false, status: 401, error: 'Acesso não autenticado.' };
  }

  if (allowedRoles.includes(user.role) || user.role === 'proprietario') {
    return { allowed: true };
  }

  return {
    allowed: false,
    status: 403,
    error: `Acesso negado: Perfil '${user.role}' não possui permissão para esta operação.`
  };
}

