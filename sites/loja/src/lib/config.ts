/** Endereço interno da API da loja (rede do Docker) e endereço público do site. */
export const API_URL = (process.env.API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
export const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
export const PAGE_SIZE = 24;
