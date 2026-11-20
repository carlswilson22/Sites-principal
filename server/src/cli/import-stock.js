/**
 * server/src/cli/import-stock.js
 * Importa o estoque da planilha-modelo (salva como CSV) numa instalação.
 * Uso: node --env-file=.env server/src/cli/import-stock.js estoque.csv [--dry-run]
 * Tudo ou nada: com erro em qualquer linha, nada é gravado.
 */
import fs from 'node:fs';
import { assertProductionReady } from '../config.js';

assertProductionReady();
const { getDb } = await import('../database/db.js');
const { parseStockFile } = await import('../services/stockImport.js');
const { insertVehicle } = await import('../services/vehicleInput.js');
const { vehicleUsage } = await import('../services/vehicleLimit.js');

const [file, ...flags] = process.argv.slice(2);
if (!file || !fs.existsSync(file)) {
  console.error('Uso: import-stock.js estoque.csv [--dry-run]');
  process.exit(1);
}
const parsed = parseStockFile(fs.readFileSync(file, 'utf8'));
if (parsed.fatal) { console.error(parsed.fatal); process.exit(1); }

console.log(`Linhas lidas: ${parsed.total} | válidas: ${parsed.valid.length} | com erro: ${parsed.errors.length}`);
for (const error of parsed.errors) console.log(`  linha ${error.line}: ${error.message}`);
if (parsed.errors.length) { console.error('Nada foi importado. Corrija a planilha e rode de novo.'); process.exit(2); }
if (flags.includes('--dry-run')) { console.log('Conferência concluída (nada gravado).'); process.exit(0); }

const db = getDb();
db.exec('BEGIN');
try {
  for (const item of parsed.valid) insertVehicle(db, item.values);
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}
const usage = vehicleUsage(db);
console.log(`Importados: ${parsed.valid.length} veículos. Publicados agora: ${usage.published} de ${usage.limit}.`);
if (usage.over) console.log(`ATENÇÃO: acima do limite do pacote em ${usage.over} veículo(s): ${usage.extraBlocksNeeded} bloco(s) extra de 50 a contratar.`);
