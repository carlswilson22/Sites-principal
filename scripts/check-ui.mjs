import { buildSync } from 'esbuild';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source = `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AuthProvider, TierProvider } from './packages/merchant-core/src/index.js';
import { StoreAccessProvider } from './packages/merchant-core/src/context/StoreAccessContext.jsx';
import { merchantRoutes } from './packages/merchant-core/src/components/layout/MerchantPanel.jsx';
import { normalizeVehicle } from './packages/merchant-core/src/utils/vehicles.js';
import { getVehicleGallery } from './packages/merchant-core/src/utils/vehicleGallery.js';
import { StoreServicesPage } from './packages/merchant-core/src/components/layout/StoreServicesPage.jsx';
import { StoreConciergePage } from './packages/merchant-core/src/pages/StoreConciergePage.jsx';
import { StoreFooter } from './packages/merchant-core/src/components/layout/StoreFooter.jsx';
import { VehicleCard as AutoCard } from './sites/auto-dealership/src/components/vehicles/VehicleCard.jsx';
import { VehicleCard as LuxuryCard } from './sites/luxury-dealership/src/components/vehicles/VehicleCard.jsx';
import { VehicleCard as PopularCard } from './sites/popular-dealership/src/components/vehicles/VehicleCard.jsx';
import PortalApp from './sites/portal/src/App.jsx';
import AutoApp from './sites/auto-dealership/src/App.jsx';
import LuxuryApp from './sites/luxury-dealership/src/App.jsx';
import PopularApp from './sites/popular-dealership/src/App.jsx';
import { VehicleComparatorModal } from './sites/popular-dealership/src/components/vehicles/VehicleComparatorModal.jsx';
import { AboutContactPage as AutoAbout } from './sites/auto-dealership/src/pages/AboutContactPage.jsx';
import { AboutContactPage as LuxuryAbout } from './sites/luxury-dealership/src/pages/AboutContactPage.jsx';
import { AboutContactPage as PopularAbout } from './sites/popular-dealership/src/pages/AboutContactPage.jsx';
import { VehicleDetailModal as AutoModal } from './sites/auto-dealership/src/components/vehicles/VehicleDetailModal.jsx';
import { VehicleDetailModal as LuxuryModal } from './sites/luxury-dealership/src/components/vehicles/VehicleDetailModal.jsx';
import { VehicleDetailModal as PopularModal } from './sites/popular-dealership/src/components/vehicles/VehicleDetailModal.jsx';
import { vehiclesData as autoVehicles } from './sites/auto-dealership/src/data/vehicles.js';
import { vehiclesData as luxuryVehicles } from './sites/luxury-dealership/src/data/vehicles.js';
import { vehiclesData as popularVehicles } from './sites/popular-dealership/src/data/vehicles.js';
import { dealershipInfo as autoInfo } from './sites/auto-dealership/src/data/dealershipInfo.js';
import { dealershipInfo as luxuryInfo } from './sites/luxury-dealership/src/data/dealershipInfo.js';
import { dealershipInfo as popularInfo } from './sites/popular-dealership/src/data/dealershipInfo.js';
function AboutWithFooter({ Page, dealership }) {
  return React.createElement(React.Fragment, null, React.createElement(Page), React.createElement(StoreFooter, { dealership, compact: true }));
}
for (const [name, Component, props] of [
  ['portal', PortalApp], ['modelo-1', AutoApp], ['modelo-2', LuxuryApp], ['modelo-3', PopularApp],
  ['selecao-comparacao', VehicleComparatorModal, { vehicles: popularVehicles, comparedVehicles: [], onClose: () => {}, onConfirm: () => {}, onSelectVehicle: () => {} }],
  ['servicos-modelo-2', StoreServicesPage, { premium: true, onNavigate: () => {} }],
  ['servicos-modelo-3', StoreServicesPage, { onNavigate: () => {} }],
  ['sobre-modelo-1', AboutWithFooter, { Page: AutoAbout, dealership: autoInfo }],
  ['sobre-modelo-2', AboutWithFooter, { Page: LuxuryAbout, dealership: luxuryInfo }],
  ['sobre-modelo-3', AboutWithFooter, { Page: PopularAbout, dealership: popularInfo }],
  ...[[AutoCard, autoVehicles[0]], [LuxuryCard, luxuryVehicles[0]], [PopularCard, popularVehicles[0]]].map(([Component, vehicle], index) => ['card-modelo-' + (index + 1), Component, { vehicle, onSelect: () => {} }]),
  ...[[autoInfo, 'autoelite', autoVehicles], [luxuryInfo, 'drivenow', luxuryVehicles], [popularInfo, 'apexluxury', popularVehicles]].flatMap(([dealership, storeKey, vehicles], index) => [
    ['chat-modelo-' + (index + 1), StoreConciergePage, { dealership, storeKey, vehicles, onSelectVehicle: () => {}, onNavigate: () => {} }],
  ]),
  ...[[AutoModal, autoVehicles], [LuxuryModal, luxuryVehicles], [PopularModal, popularVehicles]]
    .flatMap(([Component, vehicles], index) => [
      ...vehicles.map(vehicle => ['anuncio-modelo-' + (index + 1) + '-' + vehicle.id, Component, { vehicle: normalizeVehicle(vehicle), onClose: () => {} }]),
      ['anuncio-novo-modelo-' + (index + 1), Component, { vehicle: normalizeVehicle({ id: 'new', title: 'Teste', price: 45000 }), onClose: () => {} }],
      ['anuncio-com-simulador-' + (index + 1), Component, { vehicle: normalizeVehicle(vehicles[0]), initialFinancing: true, onClose: () => {} }],
    ]),
]) {
  try {
    const html = renderToString(React.createElement(StoreAccessProvider, { storeKey: 'qa', storeName: 'Loja de teste' }, React.createElement(Component, props)));
    if (!html.length) throw new Error('Conteúdo vazio');
    if (name.startsWith('modelo-') && (html.includes('Voltar ao Topo') || html.includes('Auto-Dealership'))) throw new Error('Texto genérico ou atalho antigo presente');
    if (name.startsWith('modelo-') && (html.match(/data-vehicle-id=/g) || []).length < 5) throw new Error('Página inicial com menos de cinco veículos');
    if (name === 'portal' && html.includes('a-la-carte-title')) throw new Error('Ferramentas à la carte ainda presentes no portal');
    if (name.startsWith('modelo-') || name.startsWith('sobre-modelo-')) {
      if (html.includes('data-store-highlight=') || ['Carros entregues com sucesso', 'Veículos periciados', 'Pré-análise de crédito', 'Veículos disponíveis'].some(label => html.includes(label))) throw new Error('Indicadores antigos ainda presentes');
      if (html.includes('Pedido de visita') || html.includes('Visitas e showroom')) throw new Error('Navegação antiga de visitas ainda presente');
      if (!html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').includes('Sobre Nós e Contato')) throw new Error('Página institucional ausente');
    }
    if (name.startsWith('sobre-modelo-') && (!html.includes('data-store-photo=') || html.includes('type="date"'))) throw new Error('Página institucional sem foto ou com agendamento');
    if (name.startsWith('sobre-modelo-')) {
      const visibleText = html.replace(/<[^>]*>/g, ' ');
      const dealership = props.dealership;
      for (const value of [dealership.telefone, dealership.whatsappFormatado, dealership.email, dealership.endereco.logradouro, ...Object.values(dealership.horarios)]) {
        const encoded = renderToString(React.createElement(React.Fragment, null, value));
        if (visibleText.split(encoded).length - 1 !== 1) throw new Error('Informação de contato ausente ou duplicada: ' + value);
      }
    }
    if (name.startsWith('card-modelo-')) {
      if (!html.includes('Visualizar anúncio') || !['Combustível', 'Motor', 'Potência'].every(label => html.includes(label))) throw new Error('Informações ou CTA do card incorretos');
      if (html.includes(props.vehicle.cambio)) throw new Error('Card ainda mostra transmissão abreviada');
    }
    if (name.startsWith('anuncio-')) {
      const count = getVehicleGallery(props.vehicle).length;
      if (!html.includes(count ? 'Foto 1 de ' + count : 'Sem fotos cadastradas')) throw new Error('Contador da galeria incorreto');
      if (count > 1 && !html.includes('Ver foto ' + count + ' de ' + count)) throw new Error('Navegação de fotos incompleta');
      if (props.vehicle.imagemPrincipal.includes('/images/catalog/') && !html.includes('Foto ilustrativa do modelo')) throw new Error('Créditos da foto ausentes');
      if (html.includes('data-financing-vehicle=') || html.includes('type="number"')) throw new Error('Simulador foi montado para visitante sem login');
      if (html.includes('data-concierge-vehicle=') || html.includes('<textarea')) throw new Error('Chat fechado está sendo montado antecipadamente');
      if (html.includes('data-feature="vehicle-360"') !== (Component === PopularModal)) throw new Error('360 habilitado em edição incorreta');
      const services = html.indexOf('data-vehicle-services=');
      const gallery = html.indexOf('Foto 1 de ');
      const financing = html.indexOf('data-financing-vehicle=');
      if (gallery >= 0 && services <= gallery) throw new Error('Serviços não estão no final do anúncio');
      if (services < 0 || !html.includes('Atendimento sobre este veículo') || !html.includes('Simular financiamento deste veículo')) throw new Error('Atendimento ou financiamento fora do final do anúncio');
      if (!html.includes('Tenho interesse')) throw new Error('CTA de interesse incorreto');
    }
    console.log('OK:', name);
  } catch (error) { console.error('FALHA:', name, error.message); process.exitCode = 1; }
}
for (const [key, route] of Object.entries(merchantRoutes)) {
  if (!route.component) continue;
  try {
    const html = renderToString(React.createElement(AuthProvider, null,
      React.createElement(TierProvider, { tier: 3 }, React.createElement(route.component, {
        storeKey: 'qa', defaultVehicles: [], vehicles: [], onNavigateTo: () => {}
      }))));
    if (!html.length) throw new Error('Seção vazia');
    console.log('OK:', key);
  } catch (error) { console.error('FALHA:', key, error.message); process.exitCode = 1; }
}
`;
const result = buildSync({ stdin: { contents: source, resolveDir: process.cwd(), loader: 'jsx' },
  bundle: true, platform: 'node', format: 'cjs', write: false, logLevel: 'silent', loader: { '.jpg': 'dataurl' },
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/Sites-principal/auto-dealership/'), 'import.meta.env.VITE_MERCHANT_DEMO': 'true' },
});
new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, { exports: {} }, {});
