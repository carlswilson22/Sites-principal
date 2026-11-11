import { createRecordId } from '../utils/recordId.js';

export const customerAccountsKey = storeKey => `demo_customer_accounts_${storeKey}`;
const reservedEmails = new Set(['cliente', 'atendente', 'gerente', 'proprietario'].map(name => `${name}@demo.invalid`));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = email => String(email || '').trim().toLowerCase();
const profile = account => ({ id: account.id, name: account.name, email: account.email, role: 'cliente', demo: true, local: true });

function accounts(storeKey, storage) {
  let raw;
  try { raw = storage.getItem(customerAccountsKey(storeKey)); }
  catch { throw new Error('Não foi possível acessar as contas deste navegador.'); }
  if (raw === null) return [];
  let list;
  try { list = JSON.parse(raw); } catch { throw new Error('Não foi possível ler as contas salvas neste navegador.'); }
  if (!Array.isArray(list) || list.length > 100 || list.some(account =>
    !account || !/^local-[a-z0-9-]{10,100}$/i.test(account.id) || account.role !== 'cliente'
    || typeof account.name !== 'string' || account.name.trim().length < 2 || account.name.length > 100
    || typeof account.email !== 'string' || account.email !== normalizeEmail(account.email)
    || !emailPattern.test(account.email) || account.email.length > 254 || reservedEmails.has(account.email)
    || typeof account.salt !== 'string' || account.salt.length < 16 || account.salt.length > 128
    || !/^[a-f0-9]{64}$/.test(account.passwordHash)
  ) || new Set(list.map(account => account.email)).size !== list.length
    || new Set(list.map(account => account.id)).size !== list.length) {
    throw new Error('Não foi possível ler as contas salvas neste navegador.');
  }
  return list;
}

async function hashPassword(password, salt) {
  const { scryptAsync } = await import('@noble/hashes/scrypt.js');
  const hash = await scryptAsync(password, salt, { N: 16384, r: 8, p: 1, dkLen: 32 });
  return Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function registerDemoCustomer(storeKey, details, storage = globalThis.localStorage) {
  const name = String(details.name || '').trim();
  const email = normalizeEmail(details.email);
  const { password, confirmPassword } = details;
  if (name.length < 2 || name.length > 100) throw new Error('Informe seu nome com 2 a 100 caracteres.');
  if (email.length > 254 || !emailPattern.test(email)) throw new Error('Informe um e-mail válido.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new Error('A senha deve ter entre 8 e 128 caracteres.');
  if (password !== confirmPassword) throw new Error('As senhas não coincidem.');
  if (!storage) throw new Error('Permita o armazenamento do navegador para criar sua conta.');
  const available = list => {
    if (reservedEmails.has(email) || list.some(account => account.email === email)) throw new Error('Este e-mail já possui uma conta. Faça login para continuar.');
    if (list.length >= 100) throw new Error('O limite de contas desta demonstração foi atingido.');
  };
  available(accounts(storeKey, storage));
  const account = { id: `local-${createRecordId()}`, name, email, role: 'cliente', salt: `${createRecordId()}-${createRecordId()}` };
  account.passwordHash = await hashPassword(password, account.salt);
  const latest = accounts(storeKey, storage);
  available(latest);
  try { storage.setItem(customerAccountsKey(storeKey), JSON.stringify([...latest, account])); }
  catch { throw new Error('Não foi possível salvar sua conta neste navegador. Verifique o armazenamento e tente novamente.'); }
  return profile(account);
}

export async function loginDemoCustomer(storeKey, email, password, storage = globalThis.localStorage) {
  const account = storage && accounts(storeKey, storage).find(item => item.email === normalizeEmail(email));
  if (!account || typeof password !== 'string' || password.length > 128
    || await hashPassword(password, account.salt) !== account.passwordHash) throw new Error('E-mail ou senha inválidos.');
  return profile(account);
}

export function registeredDemoCustomer(storeKey, id, email, storage = globalThis.localStorage) {
  const account = storage && accounts(storeKey, storage).find(item => item.id === id && item.email === email);
  return account ? profile(account) : null;
}
