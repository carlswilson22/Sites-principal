import { SITE_URL } from './config';

const NAME = 'comparar';
export const MAX_COMPARE = 3;
const SLUG = /^[\w-]{1,120}$/;

/** Lista de carros em comparação, guardada num cookie curto (sem dado pessoal). */
export function readCompare(request: Request): string[] {
  const match = new RegExp(`(?:^|;\\s*)${NAME}=([^;]*)`).exec(request.headers.get('cookie') || '');
  if (!match) return [];
  try {
    return decodeURIComponent(match[1]).split(',').filter(slug => SLUG.test(slug)).slice(0, MAX_COMPARE);
  } catch { return []; }
}

export function compareCookie(list: string[]): string {
  const secure = SITE_URL.startsWith('https') ? '; Secure' : '';
  return list.length
    ? `${NAME}=${encodeURIComponent(list.join(','))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`
    : `${NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
