import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const scenarios = [
  ['auto-dealership', 'normal'], ['luxury-dealership', 'normal'], ['popular-dealership', 'normal'],
  ['auto-dealership', 'motion'], ['auto-dealership', 'legacy-media'], ['auto-dealership', 'no-media'], ['auto-dealership', 'invalid-storage'],
];
for (const [model, scenario] of scenarios) {
  const directory = path.resolve('dist', model);
  const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
  const entry = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
  assert(entry, `Entrada não encontrada: ${model}`);
  const failures = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => failures.push(error.message));
  virtualConsole.on('error', (...args) => failures.push(args.map(String).join(' ')));
  const dom = new JSDOM(html, { url: `https://carlswilson22.github.io/Sites-principal/${model}/`, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const { window } = dom;
  const openedWindows = [];
  window.open = (...args) => { openedWindows.push(args); return null; };
  window.matchMedia = query => ({ matches: scenario !== 'motion' && query.includes('prefers-reduced-motion'), media: query, ...(scenario === 'legacy-media' ? { addListener() {}, removeListener() {} } : { addEventListener() {}, removeEventListener() {} }) });
  if (scenario === 'no-media') delete window.matchMedia;
  if (scenario === 'invalid-storage') window.localStorage.setItem('store_vehicles_autoelite', '{invalid');
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
    const ads = buttons().filter(item => item.textContent.includes('Visualizar anúncio'));
    assert(ads.length >= 5, `Vitrine incompleta: ${model}`);
    ads[0].click();
    await wait(() => document.querySelector('[role="dialog"]'));
    if (scenario === 'normal') {
      button('Simular financiamento deste veículo').click();
      await wait(() => document.querySelector('[data-financing-vehicle]'));
      button('Atendimento sobre este veículo').click();
      await wait(() => document.querySelector('[data-concierge-vehicle] textarea'));
    }
    document.querySelector('button[title="Fechar (Esc)"]').click();
    await wait(() => !document.querySelector('[role="dialog"]'));
    button('Sobre Nós e Contato').click();
    await wait(() => document.querySelector('[data-store-photo]'));
    assert.equal(document.querySelectorAll('a[href^="mailto:"]').length, 1, 'Contato duplicado na página institucional');
    if (scenario === 'normal' && model !== 'auto-dealership') {
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
    if (scenario === 'normal' && model === 'auto-dealership') {
      const input = document.querySelector('form[role="search"] input');
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, 'HB20');
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 20));
      document.querySelector('form[role="search"]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await wait(() => !document.querySelector('[data-store-layout]'));
      const results = [...document.querySelectorAll('[data-vehicle-id]')];
      assert(results.length && results.every(item => item.textContent.includes('HB20')), 'Busca inicial não acompanha o estoque');
    }
    if (scenario === 'normal' && model === 'popular-dealership') {
      const aside = document.querySelector('aside');
      const select = aside.querySelector('select');
      select.value = select.options[1].value;
      select.dispatchEvent(new window.Event('change', { bubbles: true }));
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length < 6);
      const selected = select.value;
      assert([...document.querySelectorAll('[data-vehicle-id]')].every(item => item.textContent.toUpperCase().includes(selected.toUpperCase())), 'Filtro lateral não atualiza os veículos');
      button('Limpar filtros').click();
      await wait(() => document.querySelectorAll('[data-vehicle-id]').length === 6);
      const compare = document.querySelector('button[title="Comparar este veículo"]') || document.querySelector('button[title="Remover da comparação"]');
      const before = buttons().find(item => item.textContent.includes('Comparar escolhas')).textContent;
      compare.click();
      await wait(() => buttons().find(item => item.textContent.includes('Comparar escolhas')).textContent !== before);
      buttons().find(item => item.textContent.includes('Comparar escolhas')).click();
      await wait(() => !document.querySelector('[data-store-layout]'));
    }
    assert.equal(failures.length, 0, failures.join('\n'));
    console.log(`OK: ${model} (${scenario}: inicialização, anúncio e navegação)`);
  } catch (error) {
    console.error(`FALHA: ${model} (${scenario})\n${error.stack}`);
    process.exitCode = 1;
  } finally { window.close(); }
}
