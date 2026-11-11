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
  window.TextEncoder = TextEncoder;
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
  const loginForm = () => document.querySelector('form[aria-label="Login da loja"]');
  const registrationForm = () => document.querySelector('form[aria-label="Criar conta de cliente"]');
  const favoriteShortcut = () => document.querySelector('button[aria-label="Ver carros favoritos"]');
  const changeField = async (field, value) => {
    const prototype = field instanceof window.HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, value);
    field.dispatchEvent(new window.Event(field instanceof window.HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 20));
  };
  const setLoginFields = async (email, password) => {
    await wait(() => loginForm());
    const form = loginForm();
    for (const [name, value] of Object.entries({ email, password })) {
      const input = form.elements.namedItem(name);
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    }
    await new Promise(resolve => setTimeout(resolve, 20));
  };
  const submitLogin = async (email, password, failure = false) => {
    await setLoginFields(email, password);
    const form = loginForm();
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await wait(() => failure ? form.querySelector('[role="alert"]') : !document.querySelector('button[aria-label="Fechar login"]'));
  };
  const submitRegistration = async (values, failure = false) => {
    await wait(() => registrationForm());
    const form = registrationForm();
    for (const [name, value] of Object.entries(values)) {
      const input = form.elements.namedItem(name);
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    }
    await new Promise(resolve => setTimeout(resolve, 20));
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    if (!failure) form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await wait(() => failure ? form.querySelector('[role="alert"]') : !document.querySelector('button[aria-label="Fechar login"]'));
  };
  const signInStaff = async role => {
    button('Entrar').click();
    await wait(() => loginForm());
    assert(!button('Equipe da loja'), 'Login mantém entrada separada para equipe');
    if (role === 'atendente') {
      button('Esqueceu a senha?').click();
      await wait(() => document.querySelector('section[aria-label="Recuperar acesso"]'));
      assert(document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('administrador da loja'), 'Recuperação da equipe não orienta procurar o administrador');
      assert(!document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('Cliente@2026'), 'Recuperação da equipe mostrou credenciais de cliente');
      button('Voltar ao login').click();
    }
    await submitLogin(`${role}@demo.invalid`, 'Demonstracao@2026');
    assert.equal(JSON.parse(window.sessionStorage.getItem(`store_access_${storeKey}`)).user.role, role, 'Login único identificou um perfil incorreto');
    assert(document.querySelector('button[aria-label="Painel do lojista"]'), 'Equipe autenticada sem acesso ao painel');
    if (model === 'popular-dealership') {
      for (const target of [document.querySelector('button[aria-label="Minha conta"]'), document.querySelector('button[aria-label="Painel do lojista"]')]) assert(favoriteShortcut().compareDocumentPosition(target) & window.Node.DOCUMENT_POSITION_FOLLOWING, 'Favoritos deve ficar à esquerda do painel e do perfil');
    }
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
      assert(!document.querySelector('a[href="#explorar-enterprise"]'), 'Atalho de rolagem continua na abertura');
      for (const label of ['Comparar escolhas', 'Meus favoritos']) assert(!buttons().find(item => item.textContent.includes(label)), `Atalho não foi movido para o estoque: ${label}`);
      assert(favoriteShortcut() && favoriteShortcut().dataset.favoritesCount === '0', 'Visitante não recebeu o atalho de favoritos vazio');
      assert(favoriteShortcut().compareDocumentPosition(button('Entrar')) & window.Node.DOCUMENT_POSITION_FOLLOWING, 'Atalho de favoritos deve ficar à esquerda do login');
      if (fullFlow) {
        favoriteShortcut().click();
        await wait(() => loginForm());
        assert(document.querySelector('[data-store-layout]') && !document.querySelector('h1').textContent.includes('Meus Veículos Salvos'), 'Atalho abriu favoritos sem login');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wait(() => !loginForm());
        button('Estoque').click();
        await wait(() => buttons().find(item => item.textContent.includes('Comparar escolhas')));
        buttons().find(item => item.textContent.includes('Comparar escolhas')).click();
        await wait(() => document.querySelector('[data-comparison-stage="selection"]'));
        assert(!loginForm(), 'Comparação ainda exige login');
        const guestDialog = () => document.querySelector('[data-comparison-stage]');
        const guestCompare = () => [...guestDialog().querySelectorAll('button')].find(item => /^Comparar veículos \(/.test(item.textContent.trim()));
        assert(guestCompare().disabled);
        guestDialog().querySelector('input[type="checkbox"]:not(:checked)').click();
        await wait(() => guestCompare().textContent.includes('(1)'));
        guestDialog().querySelector('input[type="checkbox"]:not(:checked)').click();
        await wait(() => !guestCompare().disabled);
        guestCompare().click();
        await wait(() => guestDialog()?.dataset.comparisonStage === 'results');
        assert.equal(guestDialog().querySelectorAll('[data-comparison-vehicle]').length, 2);
        assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Comparação pública criou uma sessão');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wait(() => !guestDialog());
        console.log('OK: Enterprise (visitante compara dois veículos sem login)');
        button('Início').click();
        await wait(() => document.querySelector('[data-store-layout]'));
      }
    } else assert(!favoriteShortcut(), 'Atalho de favoritos apareceu em modelo sem essa função');
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
      assert(!loginForm(), 'Atendimento público exigiu login');
      const ad = document.querySelector('[role="dialog"]');
      button('Simular financiamento deste veículo').click();
      await wait(() => loginForm());
      assert(!document.querySelector('[data-financing-vehicle]') && ad.isConnected, 'Simulador abriu antes do login ou fechou o anúncio');
      assert.equal(document.querySelector('[data-account-theme]').dataset.accountTheme, { 'auto-dealership': 'classic', 'luxury-dealership': 'editorial', 'popular-dealership': 'workspace' }[model], 'Login não segue a identidade da loja');
      assert(!button('Equipe da loja') && !button('Preencher acesso de teste') && !button('Experimentar conta de cliente'), 'Atalhos removidos continuam no login');
      assert.equal(loginForm().elements.namedItem('email').value, '', 'Login preencheu o e-mail automaticamente');
      assert.equal(loginForm().elements.namedItem('password').value, '', 'Login preencheu a senha automaticamente');
      await setLoginFields('cliente@demo.invalid', 'Cliente@2026');
      assert(!document.querySelector('[data-financing-vehicle]'), 'Preencher os campos iniciou uma sessão sem confirmação');
      document.querySelector('button[aria-label="Mostrar senha"]').click();
      await wait(() => loginForm().elements.namedItem('password').type === 'text');
      assert.equal(loginForm().elements.namedItem('password').value, 'Cliente@2026', 'Mostrar senha alterou a credencial');
      document.querySelector('button[aria-label="Ocultar senha"]').click();
      await wait(() => loginForm().elements.namedItem('password').type === 'password');
      button('Criar conta').click();
      await wait(() => registrationForm());
      assert(registrationForm().elements.namedItem('name') && registrationForm().elements.namedItem('confirmPassword'), 'Formulário de cadastro incompleto');
      assert(!button('Experimentar conta de cliente'), 'Cadastro preservou o atalho da conta fictícia');
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Abrir o cadastro criou uma sessão');
      button('Fazer login').click();
      await wait(() => loginForm());
      button('Esqueceu a senha?').click();
      await wait(() => document.querySelector('section[aria-label="Recuperar acesso"]'));
      assert(document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('administrador da loja'), 'Recuperação não orienta a equipe');
      assert(!document.querySelector('section[aria-label="Recuperar acesso"]').textContent.includes('Cliente@2026') && !button('Preencher acesso de teste'), 'Recuperação mantém o acesso fictício visível');
      button('Voltar ao login').click();
      await wait(() => loginForm());
      assert.equal(loginForm().elements.namedItem('email').value, 'cliente@demo.invalid');
      assert.equal(loginForm().elements.namedItem('password').type, 'password', 'Recuperação deixou a senha exposta');
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Recuperação iniciou uma sessão sem confirmação');
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
      await wait(() => !loginForm());
      assert(ad.isConnected && !document.querySelector('[data-financing-vehicle]'), 'Cancelar login abriu a ferramenta');
      button('Simular financiamento deste veículo').click();
      await submitLogin('proprietario@demo.invalid', 'Cliente@2026', true);
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Senha incorreta criou uma sessão');
      assert(!document.querySelector('button[aria-label="Painel do lojista"]'), 'Credenciais inválidas liberaram o painel');
      await submitLogin('  CLIENTE@DEMO.INVALID  ', 'Cliente@2026');
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
      button('Serviços').click();
      await wait(() => document.querySelector('h1')?.textContent === 'Serviços da loja');
      assert(!button('Favoritos') && !button('Comparar veículos'), 'Serviços preservou cópias dos atalhos do estoque');
      button('Estoque').click();
      await wait(() => buttons().find(item => item.textContent.includes('Comparar escolhas')));
      for (let index = 0; index < 2; index += 1) {
        document.querySelector('button[title="Salvar nos favoritos"]').click();
        await wait(() => favoriteShortcut().dataset.favoritesCount === String(index + 1));
      }
      buttons().find(item => item.textContent.includes('Meus favoritos')).click();
      await wait(() => document.querySelector('h1')?.textContent.includes('Meus Veículos Salvos'));
      const saved = document.querySelectorAll('[data-vehicle-id]').length;
      assert(saved > 0, 'Atalho não abriu os veículos favoritos');
      document.querySelector('button[title="Remover dos favoritos"]').click();
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length === saved - 1);
      button('Estoque').click();
      await wait(() => buttons().find(item => item.textContent.includes('Meus favoritos')));
      assert(favoriteShortcut().dataset.favoritesCount === String(saved - 1), 'Atalho do perfil não acompanha os favoritos');
      assert(buttons().find(item => item.textContent.includes('Meus favoritos')).textContent.endsWith(String(saved - 1)), 'Atalho do estoque não acompanha os favoritos');
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
      const comparisonDialog = () => document.querySelector('[data-comparison-stage]');
      const submitComparison = () => buttons().find(item => /^Comparar veículos \(/.test(item.textContent.trim()));
      await wait(() => comparisonDialog()?.dataset.comparisonStage === 'selection');
      assert(document.querySelector('main h1').textContent.includes('Explore as possibilidades'), 'Comparação retirou o usuário do estoque');
      assert.equal(document.body.style.overflow, 'hidden', 'Janela não bloqueia a rolagem de fundo');
      const removeChoice = () => comparisonDialog().querySelector('button[aria-label^="Remover "]');
      removeChoice().click();
      await wait(() => submitComparison().textContent.includes('(2)'));
      button('Cancelar').click();
      await wait(() => !comparisonDialog());
      assert(buttons().find(item => item.textContent.includes('Comparar escolhas')).textContent.endsWith('3'), 'Cancelar alterou as escolhas anteriores');
      buttons().find(item => item.textContent.includes('Comparar escolhas')).click();
      await wait(() => comparisonDialog()?.dataset.comparisonStage === 'selection');
      removeChoice().click();
      await wait(() => submitComparison().textContent.includes('(2)'));
      removeChoice().click();
      await wait(() => submitComparison().disabled);
      const choose = () => comparisonDialog().querySelector('input[type="checkbox"]:not(:checked):not(:disabled)');
      choose().click();
      await wait(() => !submitComparison().disabled);
      const comparisonSearch = comparisonDialog().querySelector('input[type="search"]');
      await changeField(comparisonSearch, 'nenhum-veiculo-comparavel');
      assert(comparisonDialog().textContent.includes('Nenhum veículo encontrado'));
      assert.equal(comparisonDialog().querySelectorAll('input[type="checkbox"]').length, 0);
      button('Limpar busca da comparação').click();
      await wait(() => choose());
      submitComparison().click();
      await wait(() => comparisonDialog()?.dataset.comparisonStage === 'results');
      assert.equal(comparisonDialog().querySelectorAll('[data-comparison-vehicle]').length, 2);
      assert.equal(comparisonDialog().querySelectorAll('details').length, 5);
      assert(comparisonDialog().querySelector('details').open, 'Preço não começa expandido');
      assert(comparisonDialog().textContent.includes('Resumo das escolhas'));
      buttons().find(item => item.textContent.includes('Adicionar 3º veículo')).click();
      await wait(() => comparisonDialog()?.dataset.comparisonStage === 'selection');
      choose().click();
      await wait(() => submitComparison().textContent.includes('(3)'));
      assert([...comparisonDialog().querySelectorAll('input[type="checkbox"]:not(:checked)')].every(field => field.disabled), 'Seleção ultrapassa três veículos');
      submitComparison().click();
      await wait(() => comparisonDialog()?.querySelectorAll('[data-comparison-vehicle]').length === 3);
      comparisonDialog().querySelectorAll('summary')[1].click();
      assert(comparisonDialog().querySelectorAll('details')[1].open, 'Seção de quilometragem não expande');
      comparisonDialog().querySelector('button').focus();
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
      await wait(() => !comparisonDialog());
      assert.equal(document.body.style.overflow, '', 'Fechar comparação manteve a página bloqueada');
      buttons().find(item => item.textContent.includes('Comparar escolhas')).click();
      await wait(() => submitComparison());
      submitComparison().click();
      await wait(() => comparisonDialog()?.dataset.comparisonStage === 'results');
      const chosenId = comparisonDialog().querySelector('[data-comparison-vehicle]').dataset.comparisonVehicle;
      button('Ver anúncio').click();
      await wait(() => document.querySelector('[role="dialog"][data-vehicle-id]'));
      assert(!comparisonDialog(), 'Anúncio abriu sobre outra janela de comparação');
      assert.equal(document.querySelector('[role="dialog"][data-vehicle-id]').dataset.vehicleId, chosenId);
      document.querySelector('button[title="Fechar (Esc)"]').click();
      await wait(() => !document.querySelector('[role="dialog"]'));
      console.log('OK: Enterprise (comparação em janela, seleção, limite, cancelamento, análise e anúncio)');
    }
    if (fullFlow) {
      await signOut();
      if (model === 'popular-dealership') {
        assert.equal(favoriteShortcut().dataset.favoritesCount, '0', 'Visitante recebeu os favoritos da conta anterior');
        document.querySelector('button[title="Salvar nos favoritos"]').click();
        await wait(() => loginForm());
        assert.equal(favoriteShortcut().dataset.favoritesCount, '0', 'Favorito foi salvo sem login');
        button('Cadastre-se').click();
        await wait(() => registrationForm());
        assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Abrir o cadastro iniciou uma sessão fictícia');
        button('Fazer login').click();
        await submitLogin('cliente@demo.invalid', 'Cliente@2026');
        await wait(() => favoriteShortcut().dataset.favoritesCount === '2');
        assert.equal(JSON.parse(window.localStorage.getItem('customer_favorites_apexluxury_cliente_customer-demo')).length, 2, 'Login não retomou o favorito solicitado na conta correta');
        await signOut();
      }
      button('Início').click();
      await wait(() => document.querySelector('[data-store-layout]'));
      buttons().find(item => item.textContent.includes('Visualizar anúncio')).click();
      await wait(() => document.querySelector('[role="dialog"]'));
      const registrationAd = document.querySelector('[role="dialog"]');
      button('Simular financiamento deste veículo').click();
      await wait(() => loginForm());
      button('Criar conta').click();
      const newCustomer = { name: 'Cliente cadastrado', email: `cliente-${scenario}@example.test`, password: 'NovaSenha@2026', confirmPassword: 'NovaSenha@2026' };
      await submitRegistration({ ...newCustomer, confirmPassword: 'OutraSenha@2026' }, true);
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null, 'Confirmação divergente criou sessão');
      await submitRegistration(newCustomer);
      await wait(() => document.querySelector('[data-financing-vehicle]'));
      assert(registrationAd.isConnected && !document.querySelector('button[aria-label="Painel do lojista"]'), 'Cadastro perdeu o anúncio ou liberou o painel');
      assert.equal(document.querySelector('[data-financing-vehicle]').dataset.financingVehicle, registrationAd.dataset.vehicleId);
      const registeredUser = JSON.parse(window.sessionStorage.getItem(`store_access_${storeKey}`)).user;
      assert.equal(registeredUser.role, 'cliente');
      const registeredAccounts = window.localStorage.getItem(`demo_customer_accounts_${storeKey}`);
      assert.equal(JSON.parse(registeredAccounts).length, 1, 'Envio repetido duplicou a conta');
      assert(!registeredAccounts.includes(newCustomer.password), 'Cadastro guardou senha aberta');
      document.querySelector('button[title="Fechar (Esc)"]').click();
      await wait(() => !document.querySelector('[role="dialog"]'));
      if (model === 'popular-dealership') {
        assert.equal(favoriteShortcut().dataset.favoritesCount, '0', 'Nova conta herdou favoritos');
        document.querySelector('button[title="Salvar nos favoritos"]').click();
        await wait(() => favoriteShortcut().dataset.favoritesCount === '1');
      }
      await signOut();
      if (model === 'popular-dealership') favoriteShortcut().click();
      else button('Entrar').click();
      await wait(() => loginForm());
      button('Criar conta').click();
      await submitRegistration(newCustomer, true);
      assert(registrationForm().querySelector('[role="alert"]').textContent.includes('já possui'), 'Cadastro duplicado não foi explicado');
      assert.equal(window.sessionStorage.getItem(`store_access_${storeKey}`), null);
      button('Fazer login').click();
      await submitLogin(newCustomer.email, 'Senha incorreta', true);
      await submitLogin(newCustomer.email, newCustomer.password);
      assert.equal(JSON.parse(window.sessionStorage.getItem(`store_access_${storeKey}`)).user.id, registeredUser.id, 'Login criou outra identidade');
      assert(!document.querySelector('button[aria-label="Painel do lojista"]'), 'Cliente cadastrado recebeu painel');
      if (model === 'popular-dealership') {
        await wait(() => document.querySelector('h1')?.textContent.includes('Meus Veículos Salvos'));
        assert.equal(JSON.parse(window.localStorage.getItem(`customer_favorites_${storeKey}_cliente_${registeredUser.id}`)).length, 1, 'Sair apagou o favorito da nova conta');
        await wait(() => document.querySelectorAll('[data-vehicle-id]').length === 1 && favoriteShortcut().dataset.favoritesCount === '1');
        assert.equal(favoriteShortcut().getAttribute('aria-current'), 'page');
      }
      await signOut();
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
      if (model === 'popular-dealership') {
        button('Simulador de financiamento').click();
        await wait(() => document.querySelector('main [data-financing-vehicle]'));
        const financing = document.querySelector('main [data-financing-vehicle]');
        const chosenPrice = Number(financing.querySelector('input[id$="-price"]').value);
        await changeField(financing.querySelector('input[id$="-entry"]'), '0');
        await changeField(financing.querySelector('select[id$="-term"]'), '12');
        await changeField(financing.querySelector('input[id$="-rate"]'), '0');
        const expectedPayment = (chosenPrice / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        assert(financing.querySelector('strong').textContent.includes(expectedPayment), 'Simulador não atualiza a parcela');
        const interest = [...financing.querySelectorAll('dl > div')].find(row => row.querySelector('dt').textContent === 'Juros estimados no período');
        assert(/0,00$/.test(interest.querySelector('dd').textContent), 'Simulador com taxa zero adiciona juros');
        button('Estúdio de Stories 1080p').click();
        await wait(() => button('Publicar Story') && !button('Publicar Story').disabled);
        assert(document.querySelector('main').textContent.includes('Conta de exemplo'));
        assert(!document.querySelector('main').textContent.includes('INSTAGRAM_ACCESS_TOKEN'));
        button('Editorial · 3 fotos').click();
        await wait(() => document.querySelector('[data-story-template="showcase_trio"]'));
        assert.equal(document.querySelector('[data-story-template]').querySelectorAll('img').length, 3, 'Layout editorial não mostra três fotos');
        button('Publicar Story').click(); button('Publicar Story')?.click();
        const samplesKey = 'store_tool_samples_' + storeKey;
        await wait(() => button('Ver publicação') && JSON.parse(window.localStorage.getItem(samplesKey))?.stories.length);
        assert(!document.querySelector('[data-publication-id]'), 'Publicar abriu uma janela sem solicitação');
        const publication = JSON.parse(window.localStorage.getItem(samplesKey)).stories[0];
        assert.equal(JSON.parse(window.localStorage.getItem(samplesKey)).stories.length, 1, 'Clique repetido duplicou a publicação');
        assert.equal(publication.story.template, 'showcase_trio');
        const titleField = [...document.querySelectorAll('label')].find(label => label.textContent.includes('Título da arte')).querySelector('input');
        await changeField(titleField, 'Título editado depois');
        assert.equal(JSON.parse(window.localStorage.getItem(samplesKey)).stories[0].story.vehicle.title, publication.story.vehicle.title, 'Edição alterou a publicação salva');
        button('Ver publicação').click();
        await wait(() => document.querySelector('[role="dialog"][data-publication-id]'));
        assert.equal(document.querySelector('[data-publication-id] h3').textContent, publication.story.vehicle.title);
        assert.equal(document.body.style.overflow, 'hidden', 'Publicação não abriu uma janela visível');
        document.querySelector('button[aria-label="Fechar publicação"]').click();
        await wait(() => !document.querySelector('[data-publication-id]'));
        button('Ver publicação').click();
        await wait(() => document.querySelector('[data-publication-id]'));
        assert.equal(document.querySelector('[data-publication-id]').dataset.publicationId, publication.id, 'Botão não reabre a mesma publicação');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wait(() => !document.querySelector('[data-publication-id]'));
        assert.equal(document.body.style.overflow, '');
        button('Consignação Completa').click();
        await wait(() => button('Nova Consignação'));
        button('Nova Consignação').click();
        await wait(() => document.querySelector('select[aria-label="Veículo em consignação"]'));
        const consignmentForm = button('Registrar Consignação').form;
        button('Preencher dados de exemplo').click();
        await wait(() => [...consignmentForm.querySelectorAll('input')].some(field => field.value === '000.000.000-00'));
        const vehicleField = consignmentForm.querySelector('select[aria-label="Veículo em consignação"]');
        await changeField(vehicleField, vehicleField.options[1].value);
        await changeField(consignmentForm.querySelector('input[type="text"]'), 'Consignante de exemplo');
        assert(consignmentForm.checkValidity(), 'Formulário de exemplo não está pronto para envio');
        consignmentForm.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => !button('Registrar Consignação') && document.querySelector('main').textContent.includes('Consignante de exemplo'));
        button('Contratos Avançados & Troca').click();
        await wait(() => button('Gerar e Emitir Minuta Contratual'));
        button('Gerar e Emitir Minuta Contratual').form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => document.querySelector('iframe[title="Prévia da minuta"]'));
        const contract = JSON.parse(window.localStorage.getItem(samplesKey)).contracts[0];
        assert(document.querySelector('iframe').srcdoc.includes(contract.vehicleTitle));
        assert(document.querySelector('iframe').srcdoc.includes('CLÁUSULA 2ª'));
        const contractType = button('Gerar e Emitir Minuta Contratual').form.querySelector('select');
        await changeField(contractType, 'termo_aditivo');
        const original = document.querySelector('select[aria-label="Contrato original"]');
        await changeField(original, contract.id);
        button('Gerar e Emitir Minuta Contratual').form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => JSON.parse(window.localStorage.getItem(samplesKey)).contracts.length === 2);
        assert(document.querySelector('iframe').srcdoc.includes(contract.code), 'Aditivo sem vínculo à minuta');
        button('Auditoria & LGPD').click();
        await wait(() => button('Exportar Dados (Art. 18, II)'));
        button('Exportar Dados (Art. 18, II)').form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => button('Baixar arquivo JSON'));
        assert(document.querySelector('main pre').textContent.includes('Marina Oliveira'));
        window.confirm = () => true;
        button('Anonimizar Titular (Art. 18, VI)').click();
        await wait(() => document.querySelector('main').textContent.includes('Cliente de exemplo anonimizado'));
        button('Exportar Dados (Art. 18, II)').form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await wait(() => document.querySelector('main pre')?.textContent.includes('Titular anonimizado'));
        assert(!document.querySelector('main pre').textContent.includes('90000-0000'));
        assert(document.querySelector('main').textContent.includes('STORY_PUBLICADO_NA_PREVIA'));
        button('Estúdio de Stories 1080p').click();
        await wait(() => button('Ver publicação'));
        button('Ver publicação').click();
        await wait(() => document.querySelector('[data-publication-id]'));
        assert.equal(document.querySelector('[data-publication-id]').dataset.publicationId, publication.id, 'Histórico não foi restaurado');
        button('Voltar ao histórico').click();
        await wait(() => !document.querySelector('[data-publication-id]'));
        button('DRE & Comissões Vendedores').click();
        await wait(() => button('Catálogo Portais (CSV)'));
        const downloads = [];
        const blobs = [];
        window.URL.createObjectURL = blob => { blobs.push(blob); return 'blob:sample-' + blobs.length; };
        window.URL.revokeObjectURL = () => {};
        window.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
        button('Catálogo Portais (CSV)').click();
        assert.equal(downloads.at(-1), 'catalogo-veiculos.csv');
        assert.equal(blobs.at(-1).type, 'text/csv;charset=utf-8');
        assert(!openedWindows.some(([url]) => String(url).includes('/api/tier3/portals/export')), 'Exportação abriu uma rota inexistente');
        console.log('OK: Enterprise (publicação de Story, histórico, consignação, minutas, aditivo e anonimização)');
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
