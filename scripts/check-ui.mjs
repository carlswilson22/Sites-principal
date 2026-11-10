import { buildSync } from 'esbuild';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source = `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AuthProvider, TierProvider } from './packages/merchant-core/src/index.js';
import { merchantRoutes } from './packages/merchant-core/src/components/layout/MerchantPanel.jsx';
import { normalizeVehicle } from './packages/merchant-core/src/utils/vehicles.js';
import PortalApp from './sites/portal/src/App.jsx';
import AutoApp from './sites/auto-dealership/src/App.jsx';
import LuxuryApp from './sites/luxury-dealership/src/App.jsx';
import PopularApp from './sites/popular-dealership/src/App.jsx';
import { VehicleDetailModal as AutoModal } from './sites/auto-dealership/src/components/vehicles/VehicleDetailModal.jsx';
import { VehicleDetailModal as LuxuryModal } from './sites/luxury-dealership/src/components/vehicles/VehicleDetailModal.jsx';
import { VehicleDetailModal as PopularModal } from './sites/popular-dealership/src/components/vehicles/VehicleDetailModal.jsx';
import { vehiclesData as autoVehicles } from './sites/auto-dealership/src/data/vehicles.js';
import { vehiclesData as luxuryVehicles } from './sites/luxury-dealership/src/data/vehicles.js';
import { vehiclesData as popularVehicles } from './sites/popular-dealership/src/data/vehicles.js';
for (const [name, Component, props] of [
  ['portal', PortalApp], ['modelo-1', AutoApp], ['modelo-2', LuxuryApp], ['modelo-3', PopularApp],
  ...[[AutoModal, autoVehicles], [LuxuryModal, luxuryVehicles], [PopularModal, popularVehicles]]
    .flatMap(([Component, vehicles], index) => [
      ['anuncio-modelo-' + (index + 1), Component, { vehicle: normalizeVehicle(vehicles[0]), onClose: () => {} }],
      ['anuncio-novo-modelo-' + (index + 1), Component, { vehicle: normalizeVehicle({ id: 'new', title: 'Teste', price: 45000 }), onClose: () => {} }],
    ]),
]) {
  try {
    const html = renderToString(React.createElement(Component, props));
    if (!html.length) throw new Error('Conteúdo vazio');
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
  bundle: true, platform: 'node', format: 'cjs', write: false, logLevel: 'silent',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/Sites-principal/auto-dealership/'), 'import.meta.env.VITE_MERCHANT_DEMO': 'true' },
});
new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, { exports: {} }, {});
