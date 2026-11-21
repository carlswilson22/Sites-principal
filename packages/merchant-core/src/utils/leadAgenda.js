export function leadUnanswered(lead, now = Date.now(), minutes = 60) {
  const raw = String(lead.created_at || '');
  const created = Date.parse(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(raw) ? `${raw.replace(' ', 'T')}Z` : raw);
  return lead.status === 'novo' && Number.isFinite(created) && now - created >= minutes * 60000;
}

export function leadDueGroup(lead, now = new Date()) {
  if (!lead.next_action_at || ['ganho', 'perdido'].includes(lead.status)) return null;
  const due = new Date(lead.next_action_at);
  if (!Number.isFinite(due.getTime())) return null;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (due < now) return 'atrasados';
  if (due < end) return 'hoje';
  return 'proximos';
}

export function leadBooking(lead) {
  let data = lead.simulation_data || lead.simulation;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return null; } }
  return data?.booking || null;
}
