/**
 * server/src/services/slug.js
 * Endereço amigável do veículo (ex.: honda-civic-exl-2021-12) e preenchimento dos que ainda não têm.
 */
export function slugify(text) {
  return String(text || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export const vehicleSlug = (row, id) => `${slugify(`${row.title} ${row.version || ''} ${String(row.year || '').slice(0, 4)}`)}-${id}`;

/** Garante endereço próprio em todo veículo (cadastros antigos ou carregados direto no banco). */
export function backfillSlugs(db) {
  const rows = db.prepare("SELECT id, title, version, year FROM vehicles WHERE slug IS NULL OR slug = ''").all();
  const update = db.prepare('UPDATE vehicles SET slug = ? WHERE id = ?');
  for (const row of rows) update.run(vehicleSlug(row, row.id), row.id);
  return rows.length;
}
