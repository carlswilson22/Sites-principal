const phoneKey = value => String(value || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
const nameKey = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');

// Um telefone compartilhado por pessoas diferentes exige escolha explícita.
export function findContractClient(clients, { clientId, clientName, clientPhone }) {
  if (clientId != null) {
    const selected = clients.find(client => String(client.id) === String(clientId));
    if (!selected) throw new Error('O cliente selecionado não está mais disponível. Selecione novamente.');
    return selected;
  }
  const phone = phoneKey(clientPhone);
  if (phone.length < 10 || phone.length > 11) throw new Error('Informe um telefone com DDD para identificar o cliente.');
  const matches = clients.filter(client => phoneKey(client.phone) === phone);
  if (!matches.length) return null;
  const exact = matches.filter(client => nameKey(client.name) === nameKey(clientName));
  if (exact.length === 1) return exact[0];
  throw new Error('Este telefone já pertence a um cadastro. Selecione o cliente existente para evitar duplicidade.');
}
