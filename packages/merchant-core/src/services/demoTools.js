import { createRecordId } from '../utils/recordId.js';
import { normalizeVehicle } from '../utils/vehicles.js';
import { calculateConsignmentSettlement, checkConsignmentStatus } from '../utils/consignments.js';
import { generateAdvancedContractHtml, generateContractCode } from '../utils/advancedContracts.js';

const empty = () => ({ stories: [], consignments: [], contracts: [], audit: [], anonymized: [] });
const keyFor = storeKey => {
  if (!storeKey || !/^[\w-]{1,80}$/.test(storeKey)) throw new Error('Selecione uma loja para continuar.');
  return `store_tool_samples_${storeKey}`;
};
function read(storeKey, storage = globalThis.localStorage) {
  const raw = storage?.getItem(keyFor(storeKey));
  if (raw == null) return empty();
  try {
    const data = JSON.parse(raw);
    if (!data || Object.keys(empty()).some(key => !Array.isArray(data[key]))) throw Error();
    for (const key of ['stories', 'consignments', 'contracts', 'audit']) if (data[key].some(item => !item || typeof item !== 'object' || Array.isArray(item))) throw Error();
    if (data.stories.some(item => !item.story?.vehicle || !Array.isArray(item.story?.photos))) throw Error();
    return data;
  } catch { throw new Error('Os exemplos salvos estão inválidos. Os dados foram preservados.'); }
}
function write(storeKey, data, storage = globalThis.localStorage) {
  try { storage.setItem(keyFor(storeKey), JSON.stringify(data)); }
  catch { throw new Error('Não foi possível salvar neste navegador. Libere espaço e tente novamente.'); }
}
function audit(data, action, entity, entityId) {
  data.audit.unshift({ id: createRecordId(), user_name: 'Equipe da loja', user_role: 'proprietario', action, entity, entity_id: entityId, created_at: new Date().toISOString(), ip_address: 'Exemplo local' });
  data.audit = data.audit.slice(0, 100);
}
const sampleClient = id => ({ id: String(id), name: 'Marina Oliveira — exemplo', cpf_masked: '***.***.***-**', phone: '(11) 90000-0000', address: 'Endereço de exemplo', email: 'cliente@example.invalid' });
const money = value => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error('Informe valores válidos, maiores ou iguais a zero.');
  return number;
};

export const demoTools = {
  instagramStatus(storeKey) {
    keyFor(storeKey);
    return { configured: false, demo: true, canPublish: true, account: 'enterprise.veiculos.exemplo', status: 'sample' };
  },
  history(storeKey, storage) { return read(storeKey, storage).stories; },
  publish(storeKey, payload, storage) {
    if (!payload.story?.vehicle?.title?.trim() || !payload.story?.photos?.length) throw new Error('Escolha um veículo e uma foto para publicar.');
    const data = read(storeKey, storage);
    const story = JSON.parse(JSON.stringify(payload.story));
    if (JSON.stringify(story).length > 100000) throw new Error('Use fotos do catálogo para esta publicação de exemplo.');
    const publication = { id: createRecordId(), status: 'sample_published', caption: String(payload.caption || '').slice(0, 2200), story, account: this.instagramStatus(storeKey).account, created_at: new Date().toISOString() };
    data.stories = [publication, ...data.stories].slice(0, 20);
    audit(data, 'STORY_PUBLICADO_NA_PREVIA', 'stories', publication.id);
    write(storeKey, data, storage);
    return { success: true, demo: true, publication, message: 'Story publicado na prévia da conta de exemplo.' };
  },
  consignments(storeKey, vehicles = [], storage) {
    const data = read(storeKey, storage);
    const first = vehicles[0] && normalizeVehicle(vehicles[0]);
    const records = data.consignments.length || !first ? data.consignments : [{ id: 'sample-consignment', vehicle_id: first.id, owner_name: 'Fernando Prado — exemplo', remuneration_type: 'percentual', remuneration_value: 6, min_remuneration: 3500, service_fee: 350, daily_storage_fee: 15, contract_start: new Date().toISOString().slice(0, 10), contract_end: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), payout_deadline_days: 5 }];
    return records.map(record => {
      const vehicle = vehicles.find(item => String(item.id) === String(record.vehicle_id));
      const car = vehicle ? normalizeVehicle(vehicle) : { title: record.vehicle_title, price: record.vehicle_price };
      const days = Math.max(0, Math.floor((Date.now() - new Date(`${record.contract_start}T00:00:00`).getTime()) / 86400000));
      return { ...record, vehicle_title: car.title, vehicle_price: car.price, days_in_stock: days, owner_cpf_masked: '***.***.***-**', expiry: checkConsignmentStatus(record.contract_end), settlement: calculateConsignmentSettlement({ vehiclePrice: car.price, remunerationType: record.remuneration_type, remunerationValue: record.remuneration_value, minRemuneration: record.min_remuneration, serviceFee: record.service_fee, dailyStorageFee: record.daily_storage_fee, daysInStock: days, advancedExpenses: record.advanced_expenses }) };
    });
  },
  saveConsignment(storeKey, form, vehicles, storage) {
    const vehicle = vehicles.find(item => String(item.id) === String(form.vehicle_id));
    if (!vehicle || !form.owner_name?.trim()) throw new Error('Selecione um veículo e informe o nome do consignante.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.contract_start) || !/^\d{4}-\d{2}-\d{2}$/.test(form.contract_end) || !Number.isFinite(Date.parse(form.contract_start)) || !Number.isFinite(Date.parse(form.contract_end)) || form.contract_end < form.contract_start) throw new Error('Confira as datas de início e fim da vigência.');
    if (!['percentual', 'valor_liquido'].includes(form.remuneration_type)) throw new Error('Escolha uma modalidade de remuneração.');
    const values = Object.fromEntries(['remuneration_value', 'min_remuneration', 'service_fee', 'daily_storage_fee', 'payout_deadline_days', 'advanced_expenses'].map(key => [key, money(form[key] || 0)]));
    if (form.remuneration_type === 'percentual' && values.remuneration_value > 100) throw new Error('A comissão deve estar entre 0 e 100%.');
    const car = normalizeVehicle(vehicle);
    const data = read(storeKey, storage);
    data.consignments = this.consignments(storeKey, vehicles, storage).filter(item => String(item.vehicle_id) !== String(form.vehicle_id));
    const record = { id: createRecordId(), vehicle_id: car.id, vehicle_title: car.title, vehicle_price: car.price, owner_name: form.owner_name.trim().slice(0, 100), remuneration_type: form.remuneration_type, ...values, contract_start: form.contract_start, contract_end: form.contract_end, status: 'ativo' };
    data.consignments.unshift(record);
    audit(data, 'CONSIGNACAO_CRIADA', 'consignments', record.id);
    write(storeKey, data, storage);
    return { success: true, record, message: 'Consignação registrada.' };
  },
  contracts(storeKey, storage) { return read(storeKey, storage).contracts; },
  createContract(storeKey, payload, vehicles, dealership, storage) {
    const data = read(storeKey, storage);
    const vehicle = vehicles.find(item => String(item.id) === String(payload.vehicle_id));
    if (!vehicle || !String(payload.client_id || '').trim()) throw new Error('Selecione um veículo e informe o cliente.');
    if (!['consignacao', 'compra_venda_troca', 'termo_aditivo'].includes(payload.type)) throw new Error('Selecione um tipo de contrato.');
    const parent = data.contracts.find(item => String(item.id) === String(payload.parent_contract_id));
    if (payload.type === 'termo_aditivo' && !parent) throw new Error('Escolha um contrato emitido para vincular o aditivo.');
    const car = normalizeVehicle(vehicle);
    const consignment = this.consignments(storeKey, vehicles, storage).find(item => String(item.vehicle_id) === String(car.id));
    const terms = { ...payload.terms, remunerationType: consignment?.remuneration_type || 'percentual', remunerationValue: consignment?.remuneration_value ?? 6, minRemuneration: consignment?.min_remuneration ?? 0, serviceFee: consignment?.service_fee ?? 350, dailyStorageFee: consignment?.daily_storage_fee ?? 15, payoutDeadlineDays: consignment?.payout_deadline_days ?? 5, contractEnd: consignment?.contract_end || '30 dias' };
    terms.tradeValue = money(terms.tradeValue || 0);
    terms.tradeDebtAmount = terms.tradeHasDebt ? money(terms.tradeDebtAmount || 0) : 0;
    terms.financedBalance = Math.max(0, car.price - terms.tradeValue + terms.tradeDebtAmount);
    const code = generateContractCode('CTR', data.contracts.length + 1);
    const html = generateAdvancedContractHtml({ ...payload, code, parentCode: parent?.code, terms, client: sampleClient(payload.client_id), vehicle: car, store: { name: dealership.nome || 'Enterprise Veículos', cnpj: dealership.cnpj || '00.000.000/0001-00', address: 'Endereço da loja de exemplo' } });
    const record = { id: createRecordId(), code, type: payload.type, vehicle_id: car.id, vehicleTitle: car.title, client_id: String(payload.client_id), parent_contract_id: parent?.id, html, created_at: new Date().toISOString() };
    data.contracts.unshift(record);
    audit(data, 'CONTRATO_EMITIDO', 'contracts', record.id);
    write(storeKey, data, storage);
    return record;
  },
  audit(storeKey, storage) { return read(storeKey, storage).audit; },
  exportClient(storeKey, id, storage) {
    if (!String(id).trim()) throw new Error('Informe o identificador do cliente de exemplo.');
    const data = read(storeKey, storage);
    const anonymized = data.anonymized.includes(String(id));
    const titular = anonymized ? { id: String(id), name: 'Titular anonimizado', cpf_masked: null, phone: null, email: null, address: null } : sampleClient(id);
    audit(data, 'DADOS_EXPORTADOS', 'sample_clients', id);
    write(storeKey, data, storage);
    return { titular, base: 'Exemplo local', anonimizado: anonymized, exportado_em: new Date().toISOString() };
  },
  anonymize(storeKey, id, storage) {
    if (!String(id).trim()) throw new Error('Informe o identificador do cliente de exemplo.');
    const data = read(storeKey, storage);
    data.anonymized = [...new Set([...data.anonymized, String(id)])];
    audit(data, 'TITULAR_ANONIMIZADO', 'sample_clients', id);
    write(storeKey, data, storage);
    return { success: true, message: 'Cliente de exemplo anonimizado. Exporte novamente para conferir o resultado.' };
  }
};
