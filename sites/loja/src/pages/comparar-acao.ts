import type { APIRoute } from 'astro';
import { getSettings } from '../lib/api';
import { compareCookie, MAX_COMPARE, readCompare } from '../lib/compare';
import { flashCookie, redirect, safeBackPath, sameOrigin } from '../lib/forms';

/** Adicionar, remover ou limpar a lista de carros em comparação (até 3). */
export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const settings = await getSettings();
  if (!(settings?.modules || []).includes('compare')) return new Response(null, { status: 404 });

  const form = await request.formData();
  const slug = String(form.get('slug') || '');
  const acao = String(form.get('acao') || '');
  const back = safeBackPath(form.get('voltar'), '/comparar');
  let list = readCompare(request);
  const cookies: string[] = [];

  if (acao === 'limpar') list = [];
  else if (/^[\w-]{1,120}$/.test(slug)) {
    if (acao === 'remover') list = list.filter(item => item !== slug);
    else if (acao === 'adicionar' && !list.includes(slug)) {
      if (list.length >= MAX_COMPARE) cookies.push(flashCookie(`Você já está comparando ${MAX_COMPARE} carros. Remova um para adicionar outro.`));
      else list = [...list, slug];
    }
  }
  cookies.push(compareCookie(list));
  return redirect(back, cookies);
};
