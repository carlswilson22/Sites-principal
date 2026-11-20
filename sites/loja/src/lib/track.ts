import { postApi } from './api';
import { isBot, visitorIp } from './security';

/** Visita registrada no servidor da loja, sem cookie e sem dado pessoal. Robôs não contam. */
export function trackView(request: Request, clientAddress: string | undefined, type: 'page_view' | 'vehicle_view', page: string, vehicleId?: number) {
  if (isBot(request)) return;
  postApi('/api/track', { type, page, ...(vehicleId ? { vehicle_id: vehicleId } : {}) }, visitorIp(request, clientAddress)).catch(() => {});
}
