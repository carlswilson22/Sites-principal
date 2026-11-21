import { storeSync } from './storeSync';
import { validateStoreRequest } from '../utils/concierge';

export async function submitTradeInLead(storeKey, data) {
  const contact = validateStoreRequest({ name: data.nome, phone: data.telefone });
  if (!data.consent) throw new Error('Autorize o contato da loja para continuar.');
  if (!String(data.marca || '').trim() || !String(data.modelo || '').trim()) throw new Error('Informe a marca e o modelo do veículo.');
  await storeSync.addLead(storeKey, {
    ...contact, source: 'avaliacao_troca', consent: true, vehicle_title: String(data.interesse || '').trim(),
    message: `Veículo na troca: ${data.marca} ${data.modelo} ${data.ano || ''} (${data.km || 'não informado'} km).${data.blindado ? ' Blindado.' : ''} Interesse: ${data.interesse || 'em aberto'}. Observações: ${data.observacoes || 'nenhuma'}`,
  });
}
