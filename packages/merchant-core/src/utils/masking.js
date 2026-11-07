/**
 * packages/merchant-core/src/utils/masking.js
 * Utilitários de mascaramento de strings em tela para conformidade LGPD.
 * Executável nativamente no navegador (sem dependências de Node.js).
 */

export function maskCPF(cpf) {
  if (!cpf) return '';
  const clean = String(cpf).replace(/\D/g, '');
  if (clean.length !== 11) return '***.***.***-**';
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

export function maskBankData(accountNumber) {
  if (!accountNumber) return '';
  const clean = String(accountNumber).trim();
  if (clean.length <= 4) return '****';
  return `****-${clean.slice(-3)}`;
}

