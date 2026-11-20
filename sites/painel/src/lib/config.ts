/** Endereço interno da API da loja e endereço público do painel. */
export const API_URL = (process.env.API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
export const PANEL_URL = (process.env.PANEL_URL || '').replace(/\/$/, '');
export const SESSION_COOKIE = 'painel_session';
