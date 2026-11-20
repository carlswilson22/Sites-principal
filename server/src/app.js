/**
 * server/src/app.js
 * Ponto de entrada do servidor de API para o Painel do Lojista.
 * Construído nativamente com Node 22 (node:http).
 */
import http from 'node:http';
import { parse as parseUrl } from 'node:url';
import { handleAuthRoutes } from './routes/authRoutes.js';
import { handleDashboardRoutes } from './routes/dashboardRoutes.js';
import { handleInventoryRoutes } from './routes/inventoryRoutes.js';
import { handleLeadRoutes } from './routes/leadRoutes.js';
import { handleTier2Routes } from './routes/tier2Routes.js';
import { handleTier3Routes } from './routes/tier3Routes.js';
import { getStoreTier } from './middlewares/tierGate.js';
import { config } from './config.js';
import { findPolicy } from './policy.js';
import { isModuleEnabled } from './modules.js';
import { authenticate } from './middlewares/authMiddleware.js';
import { authenticateCustomer, handleCustomerRoutes } from './routes/customerRoutes.js';
import { handleSettingsRoutes } from './routes/settingsRoutes.js';
import { handleUserRoutes } from './routes/userRoutes.js';
import { handleMediaRoutes } from './routes/mediaRoutes.js';
import { handleSiteRoutes } from './routes/siteRoutes.js';
import { allowedOrigin, readJsonBody, BodyTooLargeError } from './security/http.js';

export function createServer(settings = config) {
  return http.createServer(async (req, res) => {
    // 1. CORS por lista de origens (nunca reflete qualquer origem) e cabeçalhos de segurança
    const origin = allowedOrigin(req.headers.origin, settings);
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (settings.isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    req.trustProxy = settings.trustProxy;
    req.settings = settings;

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const { pathname } = parseUrl(req.url, true);

    // 2. Leitura do corpo JSON com limite de tamanho
    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const isUpload = /^\/api\/vehicles\/\d+\/media$/.test(pathname);
        body = await readJsonBody(req, isUpload ? settings.maxUploadBytes : settings.maxBodyBytes);
      } catch (err) {
        const tooLarge = err instanceof BodyTooLargeError;
        res.writeHead(tooLarge ? 413 : 400, { 'Content-Type': 'application/json', ...(tooLarge ? { Connection: 'close' } : {}) });
        res.end(JSON.stringify({ error: tooLarge ? 'Conteúdo grande demais.' : 'Payload JSON inválido.' }));
        // Só fecha a conexão depois que a resposta foi entregue.
        if (tooLarge) res.on('finish', () => req.destroy());
        return;
      }
    }

    try {
      // 2.5 Política central de acesso (negar por padrão) e módulos contratados
      const rule = findPolicy(req.method, pathname);
      const deny = (status, error) => {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error }));
      };
      if (!rule) return deny(404, 'Endpoint não encontrado ou não disponível neste modelo.');
      if (rule.module && !isModuleEnabled(rule.module)) return deny(404, 'Recurso não contratado nesta instalação.');
      req.moduleApproved = Boolean(rule.module);
      if (rule.access === 'staff') {
        const auth = authenticate(req);
        if (!auth.authenticated) return deny(auth.status, auth.error);
        // Senha provisória: nada funciona até a troca.
        if (auth.user.mustChangePassword && !['/api/auth/me', '/api/auth/change-password'].includes(pathname)) {
          return deny(403, 'Troque a senha provisória para continuar.');
        }
        if (rule.roles && auth.user.role !== 'proprietario' && !rule.roles.includes(auth.user.role)) {
          return deny(403, `Acesso negado: perfil '${auth.user.role}' sem permissão para esta operação.`);
        }
      } else if (rule.access === 'customer' && !authenticateCustomer(req)) {
        return deny(401, 'Entre na sua conta para continuar.');
      }

      // 2.6 Rotas da fase M2
      for (const handler of [handleSettingsRoutes, handleUserRoutes, handleMediaRoutes, handleCustomerRoutes, handleSiteRoutes]) {
        if (await handler(req, res, pathname, body)) return;
      }

      // 3. Rota de Health Check e status da loja
      if (pathname === '/api/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'ok',
          tier: getStoreTier(),
          engine: 'Auto-Dealership Merchant API',
          timestamp: new Date().toISOString()
        }));
      }

      // 4. Roteamento de Autenticação (E1 - Nível 1)
      const authHandled = await handleAuthRoutes(req, res, pathname, body);
      if (authHandled) return;

      // 5. Roteamento de Dashboard e Métricas (E2 / I5 / A5)
      const dashboardHandled = await handleDashboardRoutes(req, res, pathname);
      if (dashboardHandled) return;

      // 6. Roteamento de Estoque e Fotos (E3, E4, E5 - Nível 1)
      const inventoryHandled = await handleInventoryRoutes(req, res, pathname, body);
      if (inventoryHandled) return;

      // 7. Roteamento de Contatos e Leads (E6 - Nível 1)
      const leadHandled = await handleLeadRoutes(req, res, pathname, body);
      if (leadHandled) return;

      // 8. Roteamento de Recursos Avançados do Nível 2 (I1 a I8)
      const tier2Handled = await handleTier2Routes(req, res, pathname, body);
      if (tier2Handled) return;

      // 9. Roteamento de Recursos Exclusivos do Nível 3 (A1 a A8)
      const tier3Handled = await handleTier3Routes(req, res, pathname, body);
      if (tier3Handled) return;

      // 10. Rota não encontrada
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint não encontrado ou não disponível neste modelo.' }));
    } catch (err) {
      console.error('[API Error]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno do servidor.' }));
    }
  });
}
