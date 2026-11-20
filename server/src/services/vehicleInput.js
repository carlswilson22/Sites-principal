/**
 * server/src/services/vehicleInput.js
 * Validação e criação de veículos, compartilhadas pela API de estoque e pela importação de planilha.
 */
import { slugify } from '../routes/util.js';

export const STATUSES = ['disponivel', 'reservado', 'vendido'];
export const OWNERSHIPS = ['proprio', 'consignado', 'parceiro'];
export const JSON_FIELDS = ['tags', 'features', 'spec_sheet', 'report_data', 'dossier'];

/** Valida e normaliza os campos do veículo. Retorna { error } ou { values }. */
export function normalizeVehicleInput(body, { partial }) {
  const values = {};
  const b = body || {};
  const str = (key, max) => {
    if (b[key] === undefined) return null;
    if (typeof b[key] !== 'string' || b[key].length > max) return `${key} inválido.`;
    values[key] = b[key].trim();
    return null;
  };
  const errors = [];
  for (const [key, max] of [['title', 120], ['version', 120], ['brand', 60], ['category', 30], ['transmission', 40], ['fuel', 40], ['color', 40], ['engine', 60], ['power', 40], ['notes', 2000]]) {
    const error = str(key, max);
    if (error) errors.push(error);
  }
  if (!partial && !values.title) errors.push('Informe o título.');
  if (partial && b.title !== undefined && !values.title) errors.push('Título não pode ficar vazio.');

  if (b.year !== undefined) {
    if (!/^\d{4}(\/\d{4})?$/.test(String(b.year))) errors.push('Ano deve ser AAAA ou AAAA/AAAA.');
    else values.year = String(b.year);
  } else if (!partial) errors.push('Informe o ano.');

  if (b.price !== undefined) {
    const price = Number(b.price);
    if (!(price > 0) || price > 100000000) errors.push('Preço inválido.');
    else values.price = price;
  } else if (!partial) errors.push('Informe o preço.');

  for (const [key, max] of [['km', 3000000], ['doors', 10], ['days_in_stock', 100000]]) {
    if (b[key] === undefined) continue;
    const number = Number(b[key]);
    if (!Number.isInteger(number) || number < 0 || number > max) errors.push(`${key} inválido.`);
    else values[key] = number;
  }
  if (b.original_price !== undefined && b.original_price !== null) {
    const original = Number(b.original_price);
    if (!(original > 0)) errors.push('original_price inválido.'); else values.original_price = original;
  }
  if (b.status !== undefined) { if (!STATUSES.includes(b.status)) errors.push('Situação inválida.'); else values.status = b.status; }
  if (b.ownership_type !== undefined) { if (!OWNERSHIPS.includes(b.ownership_type)) errors.push('Tipo de propriedade inválido.'); else values.ownership_type = b.ownership_type; }
  for (const key of ['is_published', 'highlight']) {
    if (b[key] !== undefined) values[key] = b[key] ? 1 : 0;
  }
  for (const key of JSON_FIELDS) {
    if (b[key] === undefined) continue;
    const json = b[key] === null ? null : JSON.stringify(b[key]);
    if (json && json.length > 20000) errors.push(`${key} grande demais.`);
    else values[key] = json;
  }
  if (b.tags !== undefined && !Array.isArray(b.tags)) errors.push('tags deve ser uma lista.');
  if (b.features !== undefined && !Array.isArray(b.features)) errors.push('features deve ser uma lista.');
  return errors.length ? { error: errors.join(' ') } : { values };
}


const DEFAULTS = { version: '', category: 'sedan', km: 0, transmission: 'Automático', fuel: 'Flex', color: 'Não especificada', doors: 4,
  engine: '', power: '', status: 'disponivel', ownership_type: 'proprio', is_published: 1, highlight: 0, days_in_stock: 0, notes: '' };

/** Insere um veículo já validado e devolve { id, slug }. */
export function insertVehicle(db, values) {
  const row = { ...DEFAULTS, ...values };
  if (row.status === 'vendido') {
    row.sold_at = row.sold_at || new Date().toISOString();
    row.sale_price = row.sale_price ?? row.price;
  }
  const columns = Object.keys(row);
  const result = db.prepare(`INSERT INTO vehicles (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).run(...columns.map(column => row[column]));
  const id = Number(result.lastInsertRowid);
  const slug = `${slugify(`${row.title} ${row.version} ${String(row.year).slice(0, 4)}`)}-${id}`;
  db.prepare('UPDATE vehicles SET slug = ? WHERE id = ?').run(slug, id);
  return { id, slug, title: row.title };
}
