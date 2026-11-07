/**
 * server/src/security/rateLimiter.js
 * Limitador de taxa em memória (Rate Limiter) para proteção contra força bruta.
 * Utilizado primariamente no endpoint de autenticação /api/auth/login.
 */

const attemptsMap = new Map();

/**
 * Verifica e registra tentativa de requisição para uma chave (IP ou e-mail).
 * 
 * @param {string} key Identificador da origem (IP ou e-mail)
 * @param {number} maxAttempts Limite máximo de requisições na janela
 * @param {number} windowMs Duração da janela em milissegundos (padrão: 15 minutos)
 * @returns {{ allowed: boolean, remaining: number, retryAfterSeconds: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = attemptsMap.get(key) || { attempts: 0, resetTime: now + windowMs };

  // Se a janela expirou, reseta o contador
  if (now > record.resetTime) {
    record.attempts = 0;
    record.resetTime = now + windowMs;
  }

  record.attempts += 1;
  attemptsMap.set(key, record);

  const remaining = Math.max(0, maxAttempts - record.attempts);
  const allowed = record.attempts <= maxAttempts;
  const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    retryAfterSeconds: allowed ? 0 : retryAfterSeconds
  };
}

/**
 * Reseta o contador para uma chave após sucesso na autenticação
 */
export function resetRateLimit(key) {
  attemptsMap.delete(key);
}

/**
 * Limpa periodicamente entradas antigas para evitar vazamento de memória
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptsMap.entries()) {
    if (now > record.resetTime) {
      attemptsMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();
