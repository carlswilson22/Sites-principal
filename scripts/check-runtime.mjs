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
];
for (const [model, scenario] of scenarios) {
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
  try {
    const root = moduleFor(path.join(directory, entry.slice(entry.lastIndexOf('/assets/') + 1)));
    await root.link(link);
    await root.evaluate();
    await wait(() => document.querySelector('[data-store-layout]'));
    assert(document.querySelector('#root h1'), `Página em branco: ${model}`);
    if (model === 'popular-dealership') {
      const explore = document.querySelector('a[href="#explorar-enterprise"]');
      assert(explore && document.getElementById(explore.hash.slice(1)), 'Atalho da abertura não alcança a vitrine');
      for (const label of ['Comparar escolhas', 'Meus favoritos']) assert.equal(buttons().filter(item => item.textContent.includes(label)).length, 1, `Atalho duplicado na inicial: ${label}`);
    }
    if (scenario === 'legacy-favorites') {
      await wait(() => window.localStorage.getItem('apexluxury_favorites_v1'));
      assert.deepEqual(JSON.parse(window.localStorage.getItem('apexluxury_favorites_v1')), ['1', '999', '2']);
      assert(buttons().find(item => item.textContent.includes('Meus favoritos')).textContent.endsWith('2'), 'Contador inclui favoritos fora do estoque');
    }
    const ads = buttons().filter(item => item.textContent.includes('Visualizar anúncio'));
    assert(ads.length >= 5, `Vitrine incompleta: ${model}`);
    ads[0].click();
    await wait(() => document.querySelector('[role="dialog"]'));
    if (fullFlow) {
      button('Simular financiamento deste veículo').click();
      await wait(() => document.querySelector('[data-financing-vehicle]'));
      button('Atendimento sobre este veículo').click();
      await wait(() => document.querySelector('[data-concierge-vehicle] textarea'));
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
      buttons().find(item => item.textContent.includes('Comparar escolhas')).click();
      await wait(() => !document.querySelector('[data-store-layout]'));
    }
    if (fullFlow) {
      const storeKey = { 'auto-dealership': 'autoelite', 'luxury-dealership': 'drivenow', 'popular-dealership': 'apexluxury' }[model];
      window.sessionStorage.setItem('merchant_demo_user', JSON.stringify({ id: 'runtime-attendant', demo: true, role: 'atendente', name: 'Atendente de Teste', email: 'atendente@demo.invalid' }));
      button('Painel do lojista').click();
      await wait(() => button('Contratos & Termos'));
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
        const profile = document.querySelector('select[aria-label="Perfil de acesso"]');
        profile.value = role;
        profile.dispatchEvent(new window.Event('change', { bubbles: true }));
        await wait(() => JSON.parse(window.sessionStorage.getItem('merchant_demo_user')).role === role);
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
      console.log(`OK: ${model} (${checkedRoutes} acessos a módulos nos três perfis)`);
    }
    assert.equal(failures.length, 0, failures.join('\n'));
    console.log(`OK: ${model} (${scenario}: inicialização, anúncio, navegação${fullFlow ? ' e documentos do atendente' : ''})`);
  } catch (error) {
    console.error(`FALHA: ${model} (${scenario})\n${error.stack}`);
    process.exitCode = 1;
  } finally { window.close(); }
}
