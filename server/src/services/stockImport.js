/**
 * server/src/services/stockImport.js
 * Importação de estoque a partir da planilha-modelo (salva como CSV). Aceita ; ou , e números no formato brasileiro.
 * Devolve linhas válidas e erros por linha; quem chama decide se grava (tudo ou nada).
 */
import { normalizeVehicleInput } from './vehicleInput.js';

export const MAX_IMPORT_ROWS = 1000;

const strip = text => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const headerKey = text => strip(text).replace(/\(.*?\)/g, ' ').replace(/\*/g, '').replace(/\s+/g, ' ').trim();

const HEADERS = {
  titulo: 'title', versao: 'version', marca: 'brand', categoria: 'category', ano: 'year', km: 'km', cambio: 'transmission',
  combustivel: 'fuel', cor: 'color', portas: 'doors', motor: 'engine', potencia: 'power', preco: 'price',
  'preco original': 'original_price', tipo: 'ownership_type', situacao: 'status', 'dias ja em estoque': 'days_in_stock',
  opcionais: 'features', observacoes: 'notes'
};
const REQUIRED = ['title', 'year', 'price'];

export function parseCsv(text) {
  const source = String(text).replace(/^\uFEFF/, '');
  const firstLine = source.split(/\r?\n/, 1)[0] || '';
  const delimiter = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** "89.900,00", "R$ 89900", "42.000 km" -> número. Devolve NaN se não for número. */
export function parseBrazilianNumber(value) {
  let text = String(value ?? '').replace(/R\$|km|cv/gi, '').replace(/\s/g, '');
  if (text === '') return NaN;
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : NaN;
}

const ENUMS = {
  category: { sedan: 'sedan', seda: 'sedan', hatch: 'hatch', suv: 'suv', pickup: 'pickup', picape: 'pickup', esportivo: 'esportivo', outro: 'outro' },
  ownership_type: { proprio: 'proprio', consignado: 'consignado', parceiro: 'parceiro' },
  status: { disponivel: 'disponivel', reservado: 'reservado', vendido: 'vendido' }
};
const NUMERIC = ['km', 'doors', 'days_in_stock'];

export function parseStockFile(text) {
  const table = parseCsv(text).filter(cells => cells.some(cell => String(cell).trim() !== ''));
  if (!table.length) return { fatal: 'A planilha está vazia.' };
  const columns = table[0].map(name => HEADERS[headerKey(name)] || null);
  const missing = REQUIRED.filter(key => !columns.includes(key));
  if (missing.length) return { fatal: `Colunas obrigatórias ausentes: ${missing.map(key => ({ title: 'Título', year: 'Ano', price: 'Preço' }[key])).join(', ')}. Use a planilha-modelo.` };
  const dataRows = table.slice(1);
  if (dataRows.length > MAX_IMPORT_ROWS) return { fatal: `Máximo de ${MAX_IMPORT_ROWS} veículos por importação.` };

  const valid = [], errors = [];
  dataRows.forEach((cells, index) => {
    const line = index + 2;
    const raw = {};
    columns.forEach((key, i) => { if (key && String(cells[i] ?? '').trim() !== '') raw[key] = String(cells[i]).trim(); });
    if (!Object.keys(raw).length || /\(exemplo\)/i.test(raw.title || '')) return;

    const input = {};
    const problems = [];
    for (const [key, value] of Object.entries(raw)) {
      if (key === 'price' || key === 'original_price' || NUMERIC.includes(key)) {
        const number = parseBrazilianNumber(value);
        if (Number.isNaN(number)) problems.push(`${key === 'price' ? 'Preço' : key === 'original_price' ? 'Preço original' : key} não é um número`);
        else input[key] = number;
      } else if (ENUMS[key]) {
        const mapped = ENUMS[key][strip(value).trim()];
        if (!mapped) problems.push(`${key === 'status' ? 'Situação' : key === 'category' ? 'Categoria' : 'Tipo'} inválido(a): "${value}"`);
        else input[key] = mapped;
      } else if (key === 'features') {
        input.features = value.split(';').map(item => item.trim()).filter(Boolean).slice(0, 40);
      } else if (key === 'year') {
        input.year = /^\d{4}\.0$/.test(value) ? value.slice(0, 4) : value;
      } else input[key] = value;
    }
    if (problems.length) { errors.push({ line, message: problems.join('; ') }); return; }
    const { error, values } = normalizeVehicleInput(input, { partial: false });
    if (error) errors.push({ line, message: error });
    else valid.push({ line, values });
  });
  return { total: valid.length + errors.length, valid, errors };
}
