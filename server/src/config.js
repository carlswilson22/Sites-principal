/**
 * server/src/config.js
 * Configuração única da instalação, lida do ambiente (nunca do código).
 * Cada cliente tem o seu próprio arquivo .env.
 */
const list = value => String(value || '').split(',').map(item => item.trim()).filter(Boolean);

export function loadConfig(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  return {
    isProduction,
    port: parseInt(env.PORT || '3001', 10),
    // Origens permitidas para o front (CORS). Em desenvolvimento aceita localhost.
    corsOrigins: list(env.CORS_ORIGINS),
    // Só confiar em X-Forwarded-For quando houver proxy reverso (Caddy) na frente.
    trustProxy: env.TRUST_PROXY === 'true',
    maxBodyBytes: parseInt(env.MAX_BODY_BYTES || String(1024 * 1024), 10),
    // Upload de imagem em base64 (8 MB de imagem ~ 11 MB codificados)
    maxUploadBytes: parseInt(env.MAX_UPLOAD_BYTES || String(12 * 1024 * 1024), 10),
    // Cria dados fictícios. Nunca em produção, a menos que seja a instalação de demonstração.
    seedDemo: env.SEED_DEMO === 'true' || (!isProduction && env.SEED_DEMO !== 'false'),
    store: {
      name: env.STORE_NAME || 'Loja não configurada',
      cnpj: env.STORE_CNPJ || '',
      city: env.STORE_CITY || '',
      uf: env.STORE_UF || ''
    }
  };
}

export const config = loadConfig();

/** Falha cedo, na inicialização, quando a instalação de produção está insegura. */
export function assertProductionReady(env = process.env) {
  if (env.NODE_ENV !== 'production') return;
  const key = env.DATA_ENCRYPTION_KEY || '';
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error('DATA_ENCRYPTION_KEY obrigatória em produção: 32 bytes em hexadecimal (64 caracteres).');
  }
  if (!list(env.CORS_ORIGINS).length) {
    throw new Error('CORS_ORIGINS obrigatória em produção: informe as origens do site da loja.');
  }
  if (!env.STORE_NAME || !env.STORE_CNPJ) {
    throw new Error('STORE_NAME e STORE_CNPJ são obrigatórios em produção.');
  }
}
