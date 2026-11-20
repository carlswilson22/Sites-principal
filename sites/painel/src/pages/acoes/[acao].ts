import type { APIRoute } from 'astro';
import { api, errorText, type ApiResult } from '../../lib/api';
import { clearSessionCookie, flashCookie, parseNumber, redirect, safeBack, sameOrigin, sessionCookie } from '../../lib/forms';
import { buildVehicleBody } from '../../lib/vehicleForm';

type Ctx = { form: FormData; token: string; user: any; modules: string[]; request: Request };
type Handler = (c: Ctx) => Promise<Response>;

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const fail = (to: string, message: string) => redirect(to, [flashCookie(message)]);
const done = (to: string, message: string) => redirect(to, [flashCookie(message, 'ok')]);
const failApi = (to: string, result: ApiResult) => fail(to, errorText(result));
const whatsappDigits = (raw: string) => { const d = raw.replace(/\D/g, ''); return d.length === 10 || d.length === 11 ? `55${d}` : d; };

async function currentSettings(token: string) {
  const result = await api(token, 'GET', '/api/settings');
  return result.ok ? result.data : null;
}

const handlers: Record<string, Handler> = {
  // ---------- sessão ----------
  async entrar({ form }) {
    const result = await api('', 'POST', '/api/auth/login', { email: text(form, 'email').toLowerCase(), password: String(form.get('password') || '') });
    if (!result.ok || !result.data?.token) return fail('/entrar', result.status === 401 ? 'E-mail ou senha inválidos.' : errorText(result));
    return redirect(result.data.user?.mustChangePassword ? '/senha' : '/', [sessionCookie(result.data.token)]);
  },
  async sair({ token }) {
    if (token) await api(token, 'POST', '/api/auth/logout').catch(() => null);
    return redirect('/entrar', [clearSessionCookie()]);
  },
  async recuperar({ form }) {
    await api('', 'POST', '/api/auth/recover', { email: text(form, 'email') });
    return done('/esqueci-senha', 'Se o e-mail estiver cadastrado, enviamos as instruções para criar uma nova senha.');
  },
  async senha({ form, token }) {
    if (String(form.get('nova')) !== String(form.get('confirmar'))) return fail('/senha', 'A confirmação não é igual à nova senha.');
    const result = await api(token, 'POST', '/api/auth/change-password', { current_password: String(form.get('atual') || ''), new_password: String(form.get('nova') || '') });
    return result.ok ? done('/', 'Senha alterada.') : failApi('/senha', result);
  },

  // ---------- estoque ----------
  async 'veiculo-salvar'({ form, token, modules }) {
    const id = text(form, 'id');
    const { body, error } = buildVehicleBody(form, { dossier: modules.includes('dossier') });
    const back = id ? `/estoque/${id}` : '/estoque/novo';
    if (error) return fail(back, error);
    const result = id ? await api(token, 'PUT', `/api/vehicles/${Number(id)}`, body) : await api(token, 'POST', '/api/vehicles', body);
    if (!result.ok) return failApi(back, result);
    const newId = id || String(result.data.id);
    return done(`/estoque/${newId}`, id ? 'Veículo atualizado.' : 'Veículo cadastrado. Agora envie as fotos.');
  },
  async 'veiculo-vender'({ form, token }) {
    const id = Number(text(form, 'id'));
    const price = parseNumber(form.get('sale_price'));
    if (price === undefined || Number.isNaN(price) || price <= 0) return fail(`/estoque/${id}`, 'Informe o valor pelo qual o carro foi vendido.');
    const result = await api(token, 'PUT', `/api/vehicles/${id}`, { status: 'vendido', sale_price: price });
    return result.ok ? done('/estoque', 'Venda registrada. O carro saiu do site.') : failApi(`/estoque/${id}`, result);
  },
  async 'veiculo-reabrir'({ form, token }) {
    const id = Number(text(form, 'id'));
    const result = await api(token, 'PUT', `/api/vehicles/${id}`, { status: 'disponivel' });
    return result.ok ? done(`/estoque/${id}`, 'Veículo voltou para o estoque.') : failApi(`/estoque/${id}`, result);
  },
  async 'veiculo-excluir'({ form, token }) {
    const id = Number(text(form, 'id'));
    if (form.get('confirmo') !== 'on') return fail(`/estoque/${id}`, 'Marque a confirmação para excluir o veículo.');
    const result = await api(token, 'DELETE', `/api/vehicles/${id}`);
    return result.ok ? done('/estoque', 'Veículo excluído.') : failApi(`/estoque/${id}`, result);
  },
  async 'veiculo-custos'({ form, token }) {
    const id = Number(text(form, 'id'));
    const num = (name: string) => parseNumber(form.get(name));
    const values = ['city_consumption', 'road_consumption', 'tank_capacity', 'avg_maintenance', 'annual_insurance'].map(num);
    if (values.some(v => v !== undefined && (Number.isNaN(v) || v < 0))) return fail(`/estoque/${id}`, 'Custos inválidos: use só números.');
    const [city, road, tank, maintenance, insurance] = values;
    const result = await api(token, 'POST', `/api/vehicles/${id}/costs`, { city_consumption: city, road_consumption: road, tank_capacity: tank, avg_maintenance: maintenance, annual_insurance: insurance });
    return result.ok ? done(`/estoque/${id}`, 'Custos salvos.') : failApi(`/estoque/${id}`, result);
  },
  async 'foto-acao'({ form, token }) {
    const vehicleId = Number(text(form, 'vehicle_id')), mediaId = Number(text(form, 'media_id')), op = text(form, 'op');
    const back = `/estoque/${vehicleId}`;
    if (op === 'excluir') { const r = await api(token, 'DELETE', `/api/vehicles/${vehicleId}/media/${mediaId}`); return r.ok ? done(back, 'Foto removida.') : failApi(back, r); }
    if (op === 'capa') { const r = await api(token, 'PATCH', `/api/vehicles/${vehicleId}/media/${mediaId}`, { is_cover: true }); return r.ok ? done(back, 'Foto de capa definida.') : failApi(back, r); }
    if (op === 'subir' || op === 'descer') {
      const detail = await api(token, 'GET', `/api/vehicles/${vehicleId}`);
      const list: any[] = (text(form, 'kind') === 'frame360' ? detail.data?.frames360 : detail.data?.photos) || [];
      const index = list.findIndex(item => item.id === mediaId);
      const other = list[index + (op === 'subir' ? -1 : 1)];
      if (index < 0 || !other) return redirect(back);
      // Reescreve a ordem inteira, para não depender de índices repetidos
      const order = list.map(item => item.id);
      [order[index], order[index + (op === 'subir' ? -1 : 1)]] = [order[index + (op === 'subir' ? -1 : 1)], order[index]];
      for (let position = 0; position < order.length; position += 1) await api(token, 'PATCH', `/api/vehicles/${vehicleId}/media/${order[position]}`, { order_index: position });
      return redirect(back);
    }
    return redirect(back);
  },

  // ---------- contatos ----------
  async contato({ form, token }) {
    const id = Number(text(form, 'id'));
    const body: any = {};
    if (text(form, 'status')) body.status = text(form, 'status');
    if (text(form, 'temperature')) body.temperature = text(form, 'temperature');
    if (text(form, 'note')) body.note = text(form, 'note').slice(0, 500);
    const back = safeBack(form.get('voltar'), '/contatos');
    const result = await api(token, 'PATCH', `/api/leads/${id}/status`, body);
    return result.ok ? done(back, 'Contato atualizado.') : failApi(back, result);
  },

  // ---------- configurações (somente proprietário; a API também confere) ----------
  async config({ form, token, user }) {
    const section = text(form, 'secao');
    if (user?.role !== 'proprietario') return fail('/', 'Só o proprietário da loja altera as configurações. Você não tem permissão para esta ação.');
    const current = await currentSettings(token);
    if (!current) return fail('/configuracoes', 'Não foi possível ler as configurações atuais.');
    let body: any;
    if (section === 'loja') {
      const store: any = { ...current.store };
      for (const key of ['name', 'cnpj', 'phone', 'email', 'address', 'city', 'about']) store[key] = text(form, key);
      store.uf = text(form, 'uf').toUpperCase();
      store.whatsapp = whatsappDigits(text(form, 'whatsapp'));
      for (const key of Object.keys(store)) if (store[key] === '') delete store[key];
      body = { store };
    } else if (section === 'horarios') {
      const hours: any = {};
      for (const day of ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']) if (text(form, day)) hours[day] = text(form, day).slice(0, 60);
      body = { store: { ...current.store, hours } };
    } else if (section === 'servicos') {
      const services: any[] = [];
      for (let i = 0; i < 8; i += 1) if (text(form, `titulo_${i}`)) services.push({ title: text(form, `titulo_${i}`), text: text(form, `texto_${i}`) });
      body = { store: { ...current.store, services } };
    } else if (section === 'tema') {
      const theme: any = { ...current.theme, primary: text(form, 'primary') };
      if (text(form, 'logoUrl')) theme.logoUrl = text(form, 'logoUrl'); else delete theme.logoUrl;
      body = { theme };
    } else if (section === 'simulador') {
      const rates: any[] = [];
      for (let i = 0; i < 6; i += 1) {
        if (!text(form, `nome_${i}`) && !text(form, `taxa_${i}`)) continue;
        const rate = parseNumber(form.get(`taxa_${i}`));
        if (!text(form, `nome_${i}`) || rate === undefined || Number.isNaN(rate)) return fail('/configuracoes', 'Cada condição precisa de um nome e de uma taxa mensal em número.');
        rates.push({ name: text(form, `nome_${i}`), monthlyRatePercent: rate });
      }
      if (!rates.length) return fail('/configuracoes', 'Cadastre ao menos uma condição de financiamento.');
      body = { simulator: { rates } };
    } else if (section === 'comissao') {
      const rate = parseNumber(form.get('percentual'));
      if (Number.isNaN(rate)) return fail('/configuracoes', 'Percentual de comissão inválido.');
      body = { commission: rate === undefined ? null : { ratePercent: rate } };
    } else return fail('/configuracoes', 'Seção desconhecida.');
    const result = await api(token, 'PUT', '/api/settings', body);
    return result.ok ? done('/configuracoes', 'Configurações salvas.') : failApi('/configuracoes', result);
  },

  // ---------- equipe ----------
  async 'equipe-criar'({ form, token, user }) {
    if (user?.role !== 'proprietario') return fail('/', 'Só o proprietário da loja gerencia a equipe. Você não tem permissão para esta ação.');
    const result = await api(token, 'POST', '/api/users', { name: text(form, 'name'), email: text(form, 'email').toLowerCase(), role: text(form, 'role'), password: String(form.get('password') || '') });
    return result.ok ? done('/equipe', 'Pessoa adicionada à equipe.') : failApi('/equipe', result);
  },
  async 'equipe-alterar'({ form, token, user }) {
    if (user?.role !== 'proprietario') return fail('/', 'Só o proprietário da loja gerencia a equipe. Você não tem permissão para esta ação.');
    const id = Number(text(form, 'id'));
    const body: any = {};
    if (text(form, 'role')) body.role = text(form, 'role');
    if (text(form, 'ativo')) body.active = text(form, 'ativo') === '1';
    if (String(form.get('password') || '')) body.password = String(form.get('password'));
    const result = await api(token, 'PATCH', `/api/users/${id}`, body);
    return result.ok ? done('/equipe', 'Equipe atualizada.') : failApi('/equipe', result);
  }
};

const PUBLIC = new Set(['entrar', 'recuperar']);

export const POST: APIRoute = async ({ request, params, locals }) => {
  const name = String(params.acao);
  if (!sameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });

  // Envio de fotos: JSON vindo do navegador (a imagem já reduzida), repassado à API
  if (name === 'foto') {
    if (!locals.user) return Response.json({ ok: false, error: 'Sessão expirada.' }, { status: 401 });
    let body: any;
    try { body = await request.json(); } catch { return Response.json({ ok: false, error: 'Pedido inválido.' }, { status: 400 }); }
    const result = await api(locals.token, 'POST', `/api/vehicles/${Number(body.vehicle_id)}/media`, { kind: body.kind === 'frame360' ? 'frame360' : 'photo', data: body.data });
    return Response.json(result.ok ? { ok: true } : { ok: false, error: errorText(result) }, { status: result.ok ? 200 : result.status });
  }

  const handler = handlers[name];
  if (!handler) return new Response(null, { status: 404 });
  if (!PUBLIC.has(name) && !locals.user) return redirect('/entrar');
  const form = await request.formData();
  return handler({ form, token: locals.token, user: locals.user, modules: locals.settings?.modules || [], request });
};
