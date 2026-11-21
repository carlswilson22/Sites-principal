import { storeSync } from './storeSync';
import { apiFetch, isRemote } from './remote';

export function validateReminder(input) {
  const title = String(input?.title || '').trim();
  const due = Date.parse(input?.due_at || '');
  if (!title || title.length > 200 || !Number.isFinite(due)) throw new Error('Informe o lembrete e uma data válida.');
  return { title, due_at: new Date(due).toISOString(), completed: Boolean(input.completed) };
}

export const reminders = {
  async list(storeKey) {
    return isRemote ? apiFetch('/reminders') : storeSync.getRecords(storeKey, 'reminders');
  },
  async save(storeKey, input) {
    const data = validateReminder(input);
    if (isRemote) return apiFetch(input.id ? `/reminders/${encodeURIComponent(input.id)}` : '/reminders', { method: input.id ? 'PUT' : 'POST', body: data });
    const updated = storeSync.saveRecord(storeKey, 'reminders', { ...input, ...data });
    return updated[0];
  },
  async remove(storeKey, id) {
    if (isRemote) return apiFetch(`/reminders/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return storeSync.deleteRecord(storeKey, 'reminders', id);
  },
};
