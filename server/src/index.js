/**
 * server/src/index.js
 * Inicialização do serviço de backend da loja individual.
 */
import { createServer } from './app.js';
import { runSeed } from './database/seed.js';
import { getStoreTier } from './middlewares/tierGate.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const TIER = getStoreTier();

// Inicializa banco de dados com seed caso necessário
try {
  await runSeed(TIER);
  console.log(`✅ [Database] Banco de dados SQLite inicializado para o Nível ${TIER}.`);
} catch (err) {
  console.error('❌ [Database] Erro ao carregar seed inicial:', err);
}

const server = createServer();

server.listen(PORT, () => {
  console.log(`🚀 [Merchant Server] Painel do Lojista API ativo na porta ${PORT} (Nível ${TIER})`);
});
