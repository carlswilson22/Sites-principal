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
import { getStoreTier } from './middlewares/tierGate.js';

export function createServer() {
  return http.createServer(async (req, res) => {
    // 1. Configuração de CORS para desenvolvimento e produção
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const { pathname } = parseUrl(req.url, true);

    // 2. Leitura do corpo JSON para requisições com payload
    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const rawBody = Buffer.concat(buffers).toString('utf8');
        if (rawBody) {
          body = JSON.parse(rawBody);
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Payload JSON inválido.' }));
      }
    }

    try {
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

      // 9. Rota não encontrada
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint não encontrado ou não disponível neste modelo.' }));
    } catch (err) {
      console.error('[API Error]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno do servidor.' }));
    }
  });
}
