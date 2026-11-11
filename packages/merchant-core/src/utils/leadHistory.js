export const leadStatusLabels = {
  novo: 'Novo contato',
  em_atendimento: 'Em atendimento',
  ganho: 'Venda fechada',
  perdido: 'Negócio perdido',
};

export function buildLeadStatusUpdates(lead, status, note = '', now = new Date()) {
  if (!Object.hasOwn(leadStatusLabels, status)) throw new Error('Selecione uma situação válida.');
  const previous = Object.hasOwn(leadStatusLabels, lead.status) ? lead.status : 'novo';
  const message = String(note).trim();
  if (message.length > 1000) throw new Error('A observação deve ter até 1.000 caracteres.');
  if (status === previous && !message) throw new Error('Altere a situação ou escreva uma observação para registrar o atendimento.');
  return {
    status,
    ...(message ? { statusNote: message } : {}),
    history: [...(Array.isArray(lead.history) ? lead.history.filter(entry => entry && typeof entry === 'object') : []), {
      previous, status, note: message, date: now.toISOString(),
    }],
  };
}
