import { parseNumber } from './forms';

export const CATEGORIES: [string, string][] = [['sedan', 'Sedã'], ['hatch', 'Hatch'], ['suv', 'SUV'], ['pickup', 'Picape'], ['esportivo', 'Esportivo'], ['outro', 'Outro']];
export const TRANSMISSIONS = ['Automático', 'Manual', 'CVT', 'Automatizado'];
export const FUELS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico', 'GNV'];

const triBool = (value: string): boolean | undefined => (value === 'sim' ? true : value === 'nao' ? false : undefined);

/** Transforma o formulário do veículo no corpo que a API espera. Devolve { error } se algum número estiver inválido. */
export function buildVehicleBody(form: FormData, { dossier }: { dossier: boolean }): { body?: any; error?: string } {
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const body: any = {};
  for (const key of ['title', 'version', 'brand', 'category', 'transmission', 'fuel', 'color', 'engine', 'power', 'notes']) if (form.has(key)) body[key] = text(key);
  if (!body.title) return { error: 'Informe o título do veículo (marca e modelo).' };
  if (text('year')) body.year = text('year');

  for (const [key, label, integer] of [['km', 'Quilometragem', true], ['doors', 'Portas', true], ['days_in_stock', 'Dias em estoque', true], ['price', 'Preço', false], ['original_price', 'Preço anterior', false]] as [string, string, boolean][]) {
    const raw = text(key);
    if (raw === '') { if (key === 'original_price') body.original_price = null; continue; }
    const value = parseNumber(raw);
    if (value === undefined || Number.isNaN(value) || value < 0 || (integer && !Number.isInteger(value))) return { error: `${label} inválido(a): use só números.` };
    body[key] = value;
  }
  if (!body.price) return { error: 'Informe o preço do veículo.' };

  for (const key of ['status', 'ownership_type']) if (form.has(key)) body[key] = text(key);
  body.is_published = form.get('is_published') === 'on';
  body.highlight = form.get('highlight') === 'on';
  body.features = text('features').split('\n').map(line => line.trim()).filter(Boolean).slice(0, 40);
  body.report_data = text('laudo') ? { status: text('laudo') } : null;

  if (dossier) {
    const d: any = {};
    const leilao = triBool(text('d_leilao')); if (leilao !== undefined) d.leilao = leilao;
    const recall = triBool(text('d_recall')); if (recall !== undefined) d.recallPendente = recall;
    const km = triBool(text('d_km')); if (km !== undefined) d.quilometragemAutentica = km;
    if (text('d_sinistros') === 'nenhum') d.sinistros = [];
    else if (text('d_sinistros_lista')) d.sinistros = text('d_sinistros_lista').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 20);
    const owners = parseNumber(text('d_proprietarios')); if (owners !== undefined && Number.isInteger(owners) && owners > 0) d.proprietarios = owners;
    if (text('d_revisao')) d.dataUltimaRevisao = text('d_revisao');
    if (text('d_cidade')) d.cidadeRegistro = text('d_cidade');
    body.dossier = Object.keys(d).length ? d : null;
  }
  return { body };
}

/** Valores para preencher o formulário a partir do veículo devolvido pela API. */
export function dossierForm(d: any = {}) {
  const tri = (v: unknown) => (v === true ? 'sim' : v === false ? 'nao' : '');
  return {
    leilao: tri(d?.leilao), recall: tri(d?.recallPendente), km: tri(d?.quilometragemAutentica),
    sinistros: Array.isArray(d?.sinistros) ? (d.sinistros.length ? 'lista' : 'nenhum') : '',
    sinistrosLista: Array.isArray(d?.sinistros) ? d.sinistros.join('\n') : '',
    proprietarios: d?.proprietarios ?? '', revisao: d?.dataUltimaRevisao ?? '', cidade: d?.cidadeRegistro ?? ''
  };
}
