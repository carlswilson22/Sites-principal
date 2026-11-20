/**
 * server/src/index.js
 * Inicialização do serviço de backend da loja individual.
 */
import { assertProductionReady, config } from './config.js';
assertProductionReady();

const { createServer } = await import('./app.js');
const { runSeed } = await import('./database/seed.js');
const { getStoreTier } = await import('./middlewares/tierGate.js');

const TIER = getStoreTier();

// Dados fictícios só em desenvolvimento ou na instalação de demonstração (SEED_DEMO=true).
if (config.seedDemo) {
  try {
    await runSeed(TIER);
    console.log(`✅ [Database] Dados de demonstração carregados (Nível ${TIER}).`);
  } catch (err) {
    console.error('❌ [Database] Erro ao carregar seed inicial:', err);
  }
} else {
  const { getDb } = await import('./database/db.js');
  getDb();
  console.log(`✅ [Database] Banco inicializado sem dados fictícios (Nível ${TIER}).`);
}

const server = createServer();

server.listen(config.port, () => {
  console.log(`🚀 [Merchant Server] API ativa na porta ${config.port} (Nível ${TIER})`);
});
