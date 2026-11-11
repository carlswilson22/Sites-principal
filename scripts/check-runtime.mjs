import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const scenarios = [
  ['auto-dealership', 'normal'], ['luxury-dealership', 'normal'], ['popular-dealership', 'normal'],
  ['auto-dealership', 'motion'], ['auto-dealership', 'legacy-media'], ['auto-dealership', 'no-media'], ['auto-dealership', 'invalid-storage'],
  ['popular-dealership', 'invalid-favorites'], ['popular-dealership', 'legacy-favorites'],
  ['auto-dealership', 'lan-http'],
  ['auto-dealership', 'legacy-staff'], ['popular-dealership', 'invalid-account'],
];
for (const [model, scenario] of scenarios) {
  const storeKey = { 'auto-dealership': 'autoelite', 'luxury-dealership': 'drivenow', 'popular-dealership': 'apexluxury' }[model];
  const fullFlow = scenario === 'normal' || scenario === 'lan-http';
  const directory = path.resolve('dist', model);
  const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
  const entry = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
  assert(entry, `Entrada não encontrada: ${model}`);
  const failures = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => failures.push(error.message));
  virtualConsole.on('error', (...args) => failures.push(args.map(String).join(' ')));
  const origin = scenario === 'lan-http' ? 'http://192.168.1.10' : 'https://carlswilson22.github.io';
  const dom = new JSDOM(html, { url: `${origin}/Sites-principal/${model}/`, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const { window } = dom;
  if (scenario === 'lan-http') Object.defineProperty(window, 'crypto', { value: undefined });
  const openedWindows = [];
  window.open = (...args) => { openedWindows.push(args); return null; };
  window.matchMedia = query => ({ matches: scenario !== 'motion' && query.includes('prefers-reduced-motion'), media: query, ...(scenario === 'legacy-media' ? { addListener() {}, removeListener() {} } : { addEventListener() {}, removeEventListener() {} }) });
  if (scenario === 'no-media') delete window.matchMedia;
  if (scenario === 'invalid-storage') window.localStorage.setItem('store_vehicles_autoelite', '{invalid');
  if (scenario === 'invalid-favorites') window.localStorage.setItem('apexluxury_favorites_v1', '{"invalid":true}');
  if (scenario === 'legacy-favorites') window.localStorage.setItem('drivenow_favorites_v1', '[1,"1",999,2]');
  if (scenario === 'legacy-staff') window.sessionStorage.setItem('merchant_demo_user', JSON.stringify({ id: 1, role: 'proprietario', email: 'proprietario@demo.invalid', demo: true }));
  if (scenario === 'invalid-account') window.sessionStorage.setItem(`store_access_${storeKey}`, '{invalid');
  window.scrollTo = () => {};
  window.fetch = async input => {
    const url = new URL(String(input), window.location.href);
    const file = path.join(directory, url.pathname.split(`/${model}/`)[1] || '');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { failures.push(`Recurso indisponível: ${url.pathname}`); return new Response('', { status: 404 }); }
    return new Response(fs.readFileSync(file));
  };
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.addEventListener('error', event => failures.push(event.error?.stack || event.message));
  const context = dom.getInternalVMContext();
  const modules = new Map();
  function moduleFor(filename) {
    if (modules.has(filename)) return modules.get(filename);
    const source = fs.readFileSync(filename, 'utf8');
    const module = new vm.SourceTextModule(source, {
      context, identifier: filename,
      initializeImportMeta(meta) { meta.url = pathToFileURL(filename).href; },
      async importModuleDynamically(specifier, referencing) {
        const imported = moduleFor(path.resolve(path.dirname(referencing.identifier), specifier));
        if (imported.status === 'unlinked') await imported.link(link);
        if (imported.status === 'linked') await imported.evaluate();
        return imported;
      },
    });
    modules.set(filename, module);
    return module;
  }
  const link = (specifier, referencing) => moduleFor(path.resolve(path.dirname(referencing.identifier), specifier));
  const document = window.document;
  const buttons = () => [...document.querySelectorAll('button')];
  const button = text => buttons().find(item => item.textContent.trim() === text);
  const wait = async predicate => {
    const deadline = Date.now() + 4000;
    while (!predicate() && !failures.length && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(failures.length, 0, failures.join('\n'));
    assert(predicate(), `Estado não encontrado: ${model} (${scenario})`);
  };
  const loginForm = audience => document.querySelector(`form[aria-label="${audience === 'staff' ? 'Login da equipe' : 'Login de cliente'}"]`);
  const submitLogin = async (audience, email, password, failure = false) => {
    await wait(() => loginForm(audience));
    const form = loginForm(audience);
    for (const [name, value] of Object.entries({ email, password })) {
      const input = form.elements.namedItem(name);
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    }
    await new Promise(resolve => setTimeout(resolve, 20));
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await wait(() => failure ? form.querySelector('[role="alert"]') : !document.querySelector('button[aria-label="Fechar login"]'));
  };
  const signInStaff = async role => {
    button('Entrar').click();
    await wait(() => button('Equipe da loja'));
    button('Equipe da loja').click();
    if (role === 'atendente') {
      await wait(() => loginForm('staff'));
      assert(!button('Criar conta'), 'Cadastro público disponível para funcionários');
      button('Esqueceu a senha?').click();
      await wait(() => document.querySelector('section[aria-label="Recuperar acesso"]'));
      assert(document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('administrador da loja'), 'Recuperação da equipe não orienta procurar o administrador');
      assert(!document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('Cliente@2026'), 'Recuperação da equipe mostrou credenciais de cliente');
      button('Voltar ao login').click();
    }
    await submitLogin('staff', `${role}@demo.invalid`, 'Demonstracao@2026');
    assert(document.querySelector('button[aria-label="Painel do lojista"]'), 'Equipe autenticada sem acesso ao painel');
    document.querySelector('button[aria-label="Painel do lojista"]').click();
    await wait(() => button('Contratos & Termos'));
    assert(!document.querySelector('select[aria-label="Perfil de acesso"]'), 'Seletor público de cargos ainda disponível');
  };
  const signOut = async () => {
    const staffExit = document.querySelector('button[aria-label="Encerrar Sessão"]');
    if (staffExit) staffExit.click();
    else { document.querySelector('button[aria-label="Minha conta"]').click(); await wait(() => button('Sair da conta')); button('Sair da conta').click(); }
    await wait(() => button('Entrar') && !document.querySelector('button[aria-label="Painel do lojista"]'));
    assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Sair não removeu a sessão da loja');
  };
  try {
    const root = moduleFor(path.join(directory, entry.slice(entry.lastIndexOf('/assets/') + 1)));
    await root.link(link);
    await root.evaluate();
    await wait(() => document.querySelector('[data-store-layout]'));
    assert(document.querySelector('#root h1'), `Página em branco: ${model}`);
    assert(button('Entrar') && !document.querySelector('button[aria-label="Painel do lojista"]'), 'Primeira visita começou com acesso ao painel');
    if (model === 'popular-dealership') {
      const explore = document.querySelector('a[href="#explorar-enterprise"]');
      assert(explore && document.getElementById(explore.hash.slice(1)), 'Atalho da abertura não alcança a vitrine');
      for (const label of ['Comparar escolhas', 'Meus favoritos']) assert.equal(buttons().filter(item => item.textContent.includes(label)).length, 1, `Atalho duplicado na inicial: ${label}`);
      for (const label of ['Comparar escolhas', 'Meus favoritos']) assert(buttons().find(item => item.textContent.includes(label)).textContent.endsWith('0'), 'Visitante recebeu escolhas pré-selecionadas');
    }
    if (scenario === 'legacy-favorites') {
      assert.equal(window.localStorage.getItem('drivenow_favorites_v1'), '[1,"1",999,2]', 'Preferências antigas foram alteradas sem login');
    }
    const ads = buttons().filter(item => item.textContent.includes('Visualizar anúncio'));
    assert(ads.length >= 5, `Vitrine incompleta: ${model}`);
    ads[0].click();
    await wait(() => document.querySelector('[role="dialog"]'));
    if (fullFlow) {
      button('Atendimento sobre este veículo').click();
      await wait(() => document.querySelector('[data-concierge-vehicle] textarea'));
      assert(!loginForm('customer'), 'Atendimento público exigiu login');
      const ad = document.querySelector('[role="dialog"]');
      button('Simular financiamento deste veículo').click();
      await wait(() => loginForm('customer'));
      assert(!document.querySelector('[data-financing-vehicle]') && ad.isConnected, 'Simulador abriu antes do login ou fechou o anúncio');
      assert.equal(document.querySelector('[data-account-theme]').dataset.accountTheme, { 'auto-dealership': 'classic', 'luxury-dealership': 'editorial', 'popular-dealership': 'workspace' }[model], 'Login não segue a identidade da loja');
      button('Preencher acesso de teste').click();
      await wait(() => loginForm('customer').elements.namedItem('password').value === 'Cliente@2026');
      assert(!document.querySelector('[data-financing-vehicle]'), 'Preencher os campos iniciou uma sessão sem confirmação');
      document.querySelector('button[aria-label="Mostrar senha"]').click();
      await wait(() => loginForm('customer').elements.namedItem('password').type === 'text');
      assert.equal(loginForm('customer').elements.namedItem('password').value, 'Cliente@2026', 'Mostrar senha alterou a credencial');
      document.querySelector('button[aria-label="Ocultar senha"]').click();
      await wait(() => loginForm('customer').elements.namedItem('password').type === 'password');
      button('Criar conta').click();
      await wait(() => document.querySelector('section[aria-label="Criar conta de cliente"]'));
      assert(document.querySelector('section[aria-label="Criar conta de cliente"]').textContent.includes('conta fictícia'), 'Cadastro promete criar uma conta real na demonstração');
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Abrir o cadastro criou uma sessão');
      button('Fazer login').click();
      await wait(() => loginForm('customer'));
      button('Esqueceu a senha?').click();
      await wait(() => document.querySelector('section[aria-label="Recuperar acesso"]'));
      assert(document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('cliente@demo.invalid'), 'Recuperação não oferece o acesso fictício');
      button('Preencher acesso de teste').click();
      await wait(() => loginForm('customer'));
      assert.equal(loginForm('customer').elements.namedItem('email').value, 'cliente@demo.invalid');
      assert.equal(loginForm('customer').elements.namedItem('password').type, 'password', 'Recuperação deixou a senha exposta');
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Recuperação iniciou uma sessão sem confirmação');
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
      await wait(() => !loginForm('customer'));
      assert(ad.isConnected && !document.querySelector('[data-financing-vehicle]'), 'Cancelar login abriu a ferramenta');
      button('Simular financiamento deste veículo').click();
      await submitLogin('customer', 'proprietario@demo.invalid', 'Demonstracao@2026', true);
      assert(!document.querySelector('button[aria-label="Painel do lojista"]'), 'Login de cliente promoveu usuário à equipe');
      await submitLogin('customer', 'cliente@demo.invalid', 'Cliente@2026');
      await wait(() => document.querySelector('[data-financing-vehicle]'));
      assert.equal(document.querySelector('[data-financing-vehicle]').dataset.financingVehicle, ad.dataset.vehicleId, 'Login perdeu o contexto do veículo');
      assert(!document.querySelector('button[aria-label="Painel do lojista"]'), 'Cliente autenticado recebeu o painel');
      if (model === 'popular-dealership') {
        const ad = document.querySelector('[role="dialog"]');
        button('Alerta de Preço').click();
        await wait(() => document.querySelector('button[aria-label="Fechar alerta de preço"]'));
        assert.equal(document.querySelectorAll('[role="dialog"]').length, 2, 'Alerta substituiu indevidamente o anúncio');
        const photo = ad.querySelector('img').getAttribute('src');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }));
        assert.equal(ad.querySelector('img').getAttribute('src'), photo, 'Galeria mudou sob outro modal');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wait(() => document.querySelectorAll('[role="dialog"]').length === 1);
        assert(ad.isConnected && document.body.style.overflow === 'hidden', 'Esc fechou também o anúncio');
        button('Alerta de Preço').click();
        await wait(() => document.querySelector('button[aria-label="Fechar alerta de preço"]'));
        const alert = [...document.querySelectorAll('[role="dialog"]')].at(-1);
        const form = alert.querySelector('form');
        form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => alert.querySelector('[role="alert"]'));
        assert.equal(openedWindows.length, 0, 'Preço sem contato abriu o WhatsApp');
        for (const [selector, value] of [['input[type="text"]', 'Cliente de Teste'], ['input[type="tel"]', '(61) 90000-0000']]) {
          const input = form.querySelector(selector);
          Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
          input.dispatchEvent(new window.Event('input', { bubbles: true }));
        }
        await new Promise(resolve => setTimeout(resolve, 20));
        assert(form.checkValidity(), 'Preço inicial não passa na própria validação');
        form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => alert.querySelector('[role="status"]'));
        assert.equal(openedWindows.length, 1);
        assert.equal(JSON.parse(window.localStorage.getItem('store_leads_apexluxury')).filter(item => item.source === 'alerta_preco').length, 1, 'Alerta duplicou o contato');
        assert(alert.textContent.includes('Continue no WhatsApp') && !alert.textContent.includes('Você será avisado'), 'Alerta promete notificação automática');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wait(() => document.querySelectorAll('[role="dialog"]').length === 1);
        openedWindows.length = 0;
        button('Laudo Cautelar Digital').click();
        await wait(() => button('Abrir dossiê do veículo'));
        button('Abrir dossiê do veículo').click();
        await wait(() => document.querySelector('button[aria-label="Fechar dossiê do veículo"]'));
        assert(!ad.isConnected && document.body.style.overflow === 'hidden', 'Dossiê não assumiu o diálogo');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wait(() => !document.querySelector('[role="dialog"]'));
        assert.equal(document.body.style.overflow, '', 'Dossiê manteve a rolagem bloqueada');
        buttons().find(item => item.textContent.includes('Visualizar anúncio')).click();
        await wait(() => document.querySelector('[role="dialog"]'));
      }
    }
    document.querySelector('button[title="Fechar (Esc)"]').click();
    await wait(() => !document.querySelector('[role="dialog"]'));
    button('Sobre Nós e Contato').click();
    await wait(() => document.querySelector('[data-store-photo]'));
    assert.equal(document.querySelectorAll('a[href^="mailto:"]').length, 1, 'Contato duplicado na página institucional');
    if (fullFlow) {
      const inquiry = document.querySelector('form[data-store-inquiry]');
      assert(inquiry, 'Formulário institucional ausente');
      inquiry.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await wait(() => inquiry.querySelector('[role="alert"]'));
      assert.equal(openedWindows.length, 0, 'Contato inválido abriu o WhatsApp');
      for (const [name, value] of Object.entries({ nome: 'Cliente de Teste', telefone: '(61) 90000-0000', email: 'cliente@example.test', mensagem: 'Quero conhecer melhor um veículo do catálogo.' })) {
        const input = inquiry.elements.namedItem(name);
        const prototype = input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
      }
      await new Promise(resolve => setTimeout(resolve, 20));
      inquiry.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await wait(() => openedWindows.length === 1);
      const destination = new URL(openedWindows[0][0]);
      assert.equal(destination.hostname, 'wa.me');
      assert(destination.searchParams.get('text').includes('Cliente de Teste') && destination.searchParams.get('text').includes('Quero conhecer melhor um veículo do catálogo.'), 'Mensagem perdeu os dados do cliente');
      const storeKey = inquiry.dataset.storeInquiry;
      const leads = JSON.parse(window.localStorage.getItem(`store_leads_${storeKey}`));
      assert(leads.some(lead => lead.name === 'Cliente de Teste' && lead.source === 'formulario_site'), 'Contato não acompanha a loja no painel');
      assert.equal(inquiry.querySelector('[role="alert"]'), null);
      assert(inquiry.querySelector('[role="status"]').textContent.includes('Continue no WhatsApp'), 'Confirmação de encaminhamento incorreta');
      inquiry.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(openedWindows.length, 1, 'Mensagem já preparada abriu conversa duplicada');
      assert.equal(JSON.parse(window.localStorage.getItem(`store_leads_${storeKey}`)).filter(lead => lead.name === 'Cliente de Teste' && lead.source === 'formulario_site').length, 1, 'Formulário duplicou o contato');
      if (model === 'popular-dealership') {
        const address = [...document.querySelectorAll('details')].find(item => item.querySelector('summary')?.textContent.includes('Endereço'));
        assert(address && !address.open, 'Diretório de contato indisponível');
        address.querySelector('summary').click();
        await wait(() => address.open);
        const sectionLinks = [...document.querySelectorAll('nav[aria-label="Nesta página"] a')];
        assert(sectionLinks.length && sectionLinks.every(link => document.getElementById(link.hash.slice(1))), 'Navegação institucional aponta para uma seção ausente');
      }
    }
    button('Início').click();
    await wait(() => document.querySelector('[data-store-layout]'));
    if (fullFlow && model === 'auto-dealership') {
      const input = document.querySelector('form[role="search"] input');
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, 'HB20');
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
      document.querySelector('form[role="search"]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await wait(() => !document.querySelector('[data-store-layout]'));
      const results = [...document.querySelectorAll('[data-vehicle-id]')];
      assert(results.length && results.every(item => item.textContent.includes('HB20')), 'Busca inicial não acompanha o estoque');
    }
    if (fullFlow && model === 'popular-dealership') {
      for (let index = 0; index < 2; index += 1) {
        document.querySelector('button[title="Salvar nos favoritos"]').click();
        await wait(() => buttons().find(item => item.textContent.includes('Meus favoritos')).textContent.endsWith(String(index + 1)));
      }
      buttons().find(item => item.textContent.includes('Meus favoritos')).click();
      await wait(() => document.querySelector('h1')?.textContent.includes('Meus Veículos Salvos'));
      const saved = document.querySelectorAll('[data-vehicle-id]').length;
      assert(saved > 0, 'Atalho não abriu os veículos favoritos');
      document.querySelector('button[title="Remover dos favoritos"]').click();
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length === saved - 1);
      button('Início').click();
      await wait(() => document.querySelector('[data-store-layout]'));
      assert(buttons().find(item => item.textContent.includes('Meus favoritos')).textContent.endsWith(String(saved - 1)), 'Atalho da abertura não acompanha os favoritos');
      const filters = document.querySelector('[aria-label="Filtros do estoque"]');
      const select = filters.querySelector('select');
      select.value = select.options[1].value;
      select.dispatchEvent(new window.Event('change', { bubbles: true }));
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length < 6);
      const selected = select.value;
      assert([...document.querySelectorAll('[data-vehicle-id]')].every(item => item.textContent.toUpperCase().includes(selected.toUpperCase())), 'Filtro da vitrine não atualiza os veículos');
      button('Limpar filtros').click();
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length === 6);
      const search = filters.querySelector('input');
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(search, 'nenhum-veiculo-encontrado');
      search.dispatchEvent(new window.Event('input', { bubbles: true }));
      await wait(() => button('Limpar busca'));
      assert.equal(document.querySelectorAll('[data-vehicle-id]').length, 0);
      button('Limpar busca').click();
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length === 6);
      const compare = document.querySelector('button[title="Comparar este veículo"]') || document.querySelector('button[title="Remover da comparação"]');
      const before = buttons().find(item => item.textContent.includes('Comparar escolhas')).textContent;
      compare.click();
      await wait(() => buttons().find(item => item.textContent.includes('Comparar escolhas')).textContent !== before);
      for (let index = 0; index < 3; index += 1) {
        document.querySelector('button[title="Comparar este veículo"]').click();
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      assert(buttons().find(item => item.textContent.includes('Comparar escolhas')).textContent.endsWith('3'), 'Limite de comparação foi ultrapassado');
      assert(document.querySelector('[role="status"]').textContent.includes('Você pode comparar até 3'), 'Comparação não explicou o limite');
      buttons().find(item => item.textContent.includes('Comparar escolhas')).click();
      await wait(() => !document.querySelector('[data-store-layout]'));
    }
    if (fullFlow) {
      await signOut();
      if (model === 'popular-dealership') {
        for (const label of ['Comparar escolhas', 'Meus favoritos']) assert(buttons().find(item => item.textContent.includes(label)).textContent.endsWith('0'), 'Visitante recebeu as escolhas da conta anterior');
        document.querySelector('button[title="Salvar nos favoritos"]').click();
        await wait(() => loginForm('customer'));
        assert(buttons().find(item => item.textContent.includes('Meus favoritos')).textContent.endsWith('0'), 'Favorito foi salvo sem login');
        button('Cadastre-se').click();
        await wait(() => button('Experimentar conta de cliente'));
        button('Experimentar conta de cliente').click();
        await wait(() => buttons().find(item => item.textContent.includes('Meus favoritos')).textContent.endsWith('2'));
        assert.equal(JSON.parse(window.localStorage.getItem('customer_favorites_apexluxury_cliente_customer-demo')).length, 2, 'Login não retomou o favorito solicitado na conta correta');
        await signOut();
      } else {
        button('Entrar').click();
        await wait(() => button('Criar conta'));
        button('Criar conta').click();
        await wait(() => button('Experimentar conta de cliente'));
        button('Experimentar conta de cliente').click();
        await wait(() => document.querySelector('button[aria-label="Minha conta"]'));
        assert(!document.querySelector('button[aria-label="Painel do lojista"]'), 'Experimentar conta de cliente liberou o painel');
        await signOut();
      }
      await signInStaff('atendente');
      assert(!button('Financeiro & Margens'), 'Atendente recebeu acesso financeiro');
      assert(!button('Contratos Avançados & Troca'), 'Atendente recebeu acesso a contratos avançados');
      assert(button('Simulador de financiamento'), 'Simulador ausente para o atendente');
      button('Contratos & Termos').click();
      await wait(() => button('Emitir Novo Documento'));
      assert(document.querySelector('h1').textContent.includes('Contratos e Termos'), 'Rota de documentos indisponível ao atendente');
      for (const type of ['compra_venda', 'recibo_sinal', 'vistoria_simples']) {
        button('Emitir Novo Documento').click();
        await wait(() => button('Gerar Documento'));
        const form = button('Gerar Documento').form;
        const vehicle = form.querySelector('select');
        assert(vehicle.options.length > 1, 'Emissão sem acesso ao estoque da loja');
        vehicle.value = vehicle.options[1].value;
        vehicle.dispatchEvent(new window.Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 20));
        const documentType = [...form.querySelectorAll('select')].find(item => [...item.options].some(option => option.value === 'compra_venda'));
        documentType.value = type;
        documentType.dispatchEvent(new window.Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 20));
        const client = form.querySelector('input[type="text"]');
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(client, 'Cliente de Teste');
        client.dispatchEvent(new window.Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 20));
        form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => button('Imprimir / PDF'));
        const records = JSON.parse(window.localStorage.getItem(`store_contracts_${storeKey}`));
        const record = records.find(item => item.type === type && item.clientName === 'Cliente de Teste');
        assert(record?.vehicleTitle && record.doc.html.includes('Cliente de Teste'), 'Documento perdeu cliente ou veículo');
        for (const otherStore of ['autoelite', 'drivenow', 'apexluxury'].filter(key => key !== storeKey)) assert.equal(window.localStorage.getItem(`store_contracts_${otherStore}`), null, 'Documento gravado em outra loja');
        document.querySelector('button[aria-label="Fechar documento"]').click();
        await wait(() => !button('Imprimir / PDF'));
      }
      let checkedRoutes = 0;
      for (const role of ['atendente', 'gerente', 'proprietario']) {
        if (role !== 'atendente') { await signOut(); await signInStaff(role); }
        const menu = document.querySelector('nav[aria-label="Navegação do painel"]');
        const labels = [...menu.querySelectorAll('button')].map(item => item.textContent.trim());
        assert.equal(new Set(labels).size, labels.length, 'Itens duplicados no menu do painel');
        for (const label of labels) {
          [...menu.querySelectorAll('button')].find(item => item.textContent.trim() === label).click();
          await wait(() => menu.querySelector('button[aria-current="page"]')?.textContent.trim() === label && document.querySelector('main h1'));
          assert(!document.querySelector('main').textContent.includes('Não foi possível abrir esta seção'), `Rota com erro: ${model}/${role}/${label}`);
          checkedRoutes += 1;
        }
      }
      await signOut();
      assert(!document.querySelector('nav[aria-label="Navegação do painel"]'), 'Painel continuou montado após sair');
      console.log(`OK: ${model} (${checkedRoutes} acessos a módulos nos três perfis)`);
    }
    assert.equal(failures.length, 0, failures.join('\n'));
    console.log(`OK: ${model} (${scenario}: inicialização, anúncio, navegação${fullFlow ? ' e documentos do atendente' : ''})`);
  } catch (error) {
    console.error(`FALHA: ${model} (${scenario})\n${error.stack}`);
    process.exitCode = 1;
  } finally { window.close(); }
}
