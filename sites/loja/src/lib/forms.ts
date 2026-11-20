import { postApi } from './api';
import { safeBackPath, sameOrigin, visitorIp } from './security';

/** Mensagem de uma só leitura (cookie curto): nada que venha da URL aparece na tela. */
export function flashCookie(message: string, kind: 'ok' | 'erro' = 'erro') {
  return `flash=${encodeURIComponent(`${kind}|${message}`)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`;
}
export const clearFlash = 'flash=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

export function redirect(to: string, cookies: string[] = []) {
  const headers = new Headers({ Location: to, 'Cache-Control': 'no-store' });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

export function readFlash(request: Request): { kind: 'ok' | 'erro'; message: string } | null {
  const match = /(?:^|;\s*)flash=([^;]*)/.exec(request.headers.get('cookie') || '');
  if (!match) return null;
  try {
    const [kind, ...rest] = decodeURIComponent(match[1]).split('|');
    return kind === 'ok' || kind === 'erro' ? { kind, message: rest.join('|').slice(0, 300) } : null;
  } catch { return null; }
}

/** Mensagens amigáveis para respostas da API sem texto próprio. */
export const FRIENDLY: Record<number, string> = {
  400: 'Confira os campos e tente de novo.',
  401: 'E-mail ou senha inválidos.',
  403: 'Não foi possível concluir. Recarregue a página e tente de novo.',
  404: 'Não encontramos o que você procurou.',
  409: 'Não foi possível criar a conta com este e-mail.',
  429: 'Muitas tentativas. Aguarde um pouco e tente de novo.'
};

export async function apiMessage(response: Response): Promise<string> {
  try { const data = await response.json(); if (typeof data?.error === 'string') return data.error.slice(0, 250); } catch { /* sem corpo */ }
  return FRIENDLY[response.status] || 'Não foi possível concluir agora. Tente de novo em instantes.';
}

export { postApi, safeBackPath, sameOrigin, visitorIp };
