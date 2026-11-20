/**
 * server/src/cli/create-owner.js
 * Cria o proprietário inicial de uma instalação nova, com senha provisória aleatória.
 * Uso: node --env-file=.env server/src/cli/create-owner.js "Nome Completo" email@loja.com.br
 * A senha aparece UMA vez, na tela, e o sistema exige a troca no primeiro acesso.
 */
import crypto from 'node:crypto';
import { assertProductionReady } from '../config.js';

assertProductionReady();
const { getDb } = await import('../database/db.js');
const { hashPassword } = await import('../security/crypto.js');
const { getStoreTier } = await import('../middlewares/tierGate.js');

const [name, email] = process.argv.slice(2);
if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: create-owner.js "Nome Completo" email@loja.com.br');
  process.exit(1);
}
const db = getDb();
if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())) {
  console.error('Já existe um usuário com este e-mail.');
  process.exit(1);
}
// 14 caracteres com letras e números (atende à política de senha)
const password = `${crypto.randomBytes(9).toString('base64url')}a1`;
db.prepare('INSERT INTO users (name, email, password_hash, role, tier, active, must_change_password) VALUES (?, ?, ?, ?, ?, 1, 1)')
  .run(name.trim(), email.trim().toLowerCase(), await hashPassword(password), 'proprietario', getStoreTier());
console.log(`Proprietário criado: ${email}`);
console.log(`Senha provisória (mostrada só agora): ${password}`);
console.log('O sistema exigirá a troca da senha no primeiro acesso.');
