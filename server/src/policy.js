/**
 * server/src/policy.js
 * Política central de acesso: NEGAR POR PADRÃO. Toda rota /api precisa estar nesta tabela.
 * access: 'public' | 'staff' (equipe autenticada) | 'customer' (cliente do site autenticado)
 * roles: cargos permitidos (o proprietário sempre passa). module: módulo exigido na instalação.
 */
const GP = ['gerente'];   // gerente (e proprietário)
const OWNER = [];         // só proprietário

export const POLICY = [
  // Públicas
  ['GET', /^\/api\/health$/, { access: 'public' }],
  ['POST', /^\/api\/auth\/(login|logout|recover|reset)$/, { access: 'public' }],
  ['GET', /^\/api\/auth\/me$/, { access: 'staff' }],
  ['POST', /^\/api\/auth\/change-password$/, { access: 'staff' }],
  ['GET', /^\/api\/vehicles(\/[\w-]+)?$/, { access: 'public' }],
  ['POST', /^\/api\/leads$/, { access: 'public' }],
  ['POST', /^\/api\/track$/, { access: 'public' }],
  ['GET', /^\/api\/settings\/public$/, { access: 'public' }],
  ['POST', /^\/api\/financing\/calculate$/, { access: 'public' }],
  ['POST', /^\/api\/trade-ins$/, { access: 'public', module: 'trade_in' }],
  ['GET', /^\/media\//, { access: 'public' }],

  // Clientes do site
  ['POST', /^\/api\/customers\/(register|login|logout)$/, { access: 'public', module: 'customers' }],
  ['GET', /^\/api\/customers\/me$/, { access: 'customer' }],
  ['GET', /^\/api\/customers\/favorites$/, { access: 'customer', module: 'favorites' }],
  ['PUT', /^\/api\/customers\/favorites\/\d+$/, { access: 'customer', module: 'favorites' }],
  ['DELETE', /^\/api\/customers\/favorites\/\d+$/, { access: 'customer', module: 'favorites' }],
  ['POST', /^\/api\/price-alerts$/, { access: 'customer', module: 'price_alert' }],

  // Painel: núcleo (todas as edições)
  ['GET', /^\/api\/dashboard\/summary$/, { access: 'staff', module: 'dashboard' }],
  ['POST', /^\/api\/vehicles$/, { access: 'staff', module: 'inventory' }],
  ['POST', /^\/api\/vehicles\/import$/, { access: 'staff', roles: GP, module: 'inventory' }],
  ['PUT', /^\/api\/vehicles\/\d+$/, { access: 'staff', module: 'inventory' }],
  ['DELETE', /^\/api\/vehicles\/\d+$/, { access: 'staff', roles: GP, module: 'inventory' }],
  ['POST', /^\/api\/vehicles\/\d+\/photos$/, { access: 'staff', module: 'inventory' }],
  ['POST', /^\/api\/vehicles\/\d+\/media$/, { access: 'staff', module: 'inventory' }],
  ['PATCH', /^\/api\/vehicles\/\d+\/media\/\d+$/, { access: 'staff', module: 'inventory' }],
  ['DELETE', /^\/api\/vehicles\/\d+\/media\/\d+$/, { access: 'staff', module: 'inventory' }],
  ['GET', /^\/api\/leads$/, { access: 'staff', module: 'leads' }],
  ['PATCH', /^\/api\/leads\/\d+\/status$/, { access: 'staff', module: 'leads' }],
  ['POST', /^\/api\/leads\/\d+\/timeline$/, { access: 'staff', module: 'leads' }],
  ['GET', /^\/api\/contracts$/, { access: 'staff', module: 'contracts' }],
  ['POST', /^\/api\/contracts\/generate$/, { access: 'staff', module: 'contracts' }],
  ['GET', /^\/api\/settings$/, { access: 'staff', roles: OWNER, module: 'settings' }],
  ['PUT', /^\/api\/settings$/, { access: 'staff', roles: OWNER, module: 'settings' }],
  ['GET', /^\/api\/users$/, { access: 'staff', roles: OWNER, module: 'users' }],
  ['POST', /^\/api\/users$/, { access: 'staff', roles: OWNER, module: 'users' }],
  ['PATCH', /^\/api\/users\/\d+$/, { access: 'staff', roles: OWNER, module: 'users' }],
  ['GET', /^\/api\/usage$/, { access: 'staff', roles: GP, module: 'dashboard' }],

  // Gestão da loja (pacote 2)
  ['POST', /^\/api\/ai\/description$/, { access: 'staff', module: 'ai' }],
  ['GET', /^\/api\/vehicles\/\d+\/costs$/, { access: 'staff', module: 'inventory' }],
  ['POST', /^\/api\/vehicles\/\d+\/costs$/, { access: 'staff', module: 'inventory' }],
  ['GET', /^\/api\/clients$/, { access: 'staff', module: 'clients' }],
  ['POST', /^\/api\/clients$/, { access: 'staff', module: 'clients' }],
  ['GET', /^\/api\/fipe\/lookup$/, { access: 'staff', module: 'fipe' }],
  ['POST', /^\/api\/fipe\/calculate-margin$/, { access: 'staff', module: 'fipe' }],
  ['GET', /^\/api\/financial\/vehicles\/\d+$/, { access: 'staff', roles: OWNER, module: 'financial' }],
  ['POST', /^\/api\/financial\/expenses$/, { access: 'staff', roles: OWNER, module: 'financial' }],
  ['GET', /^\/api\/dashboard\/analytics$/, { access: 'staff', roles: GP, module: 'analytics' }],

  // Gestão completa (pacote 3)
  ['GET', /^\/api\/dashboard\/funnel$/, { access: 'staff', roles: GP, module: 'funnel' }],
  ['GET', /^\/api\/tier3\/consignments(\/alerts)?$/, { access: 'staff', roles: GP, module: 'consignments' }],
  ['POST', /^\/api\/tier3\/consignments(\/status)?$/, { access: 'staff', roles: GP, module: 'consignments' }],
  ['POST', /^\/api\/tier3\/contracts\/advanced$/, { access: 'staff', roles: GP, module: 'contracts_adv' }],
  ['GET', /^\/api\/tier3\/financial\/full$/, { access: 'staff', roles: OWNER, module: 'financial_full' }],
  ['POST', /^\/api\/tier3\/market-pricing$/, { access: 'staff', module: 'market_pricing' }],
  ['GET', /^\/api\/tier3\/funnel$/, { access: 'staff', roles: GP, module: 'funnel' }],
  ['GET', /^\/api\/tier3\/stories\/templates$/, { access: 'staff', module: 'stories' }],
  ['GET', /^\/api\/tier3\/instagram\/(status|history)$/, { access: 'staff', module: 'stories' }],
  ['POST', /^\/api\/tier3\/instagram\/queue$/, { access: 'staff', roles: GP, module: 'stories' }],
  ['GET', /^\/api\/tier3\/audit$/, { access: 'staff', roles: OWNER, module: 'audit_lgpd' }],
  ['GET', /^\/api\/tier3\/lgpd\/export\/\d+$/, { access: 'staff', roles: OWNER, module: 'audit_lgpd' }],
  ['POST', /^\/api\/tier3\/lgpd\/anonymize\/\d+$/, { access: 'staff', roles: OWNER, module: 'audit_lgpd' }],
  ['GET', /^\/api\/tier3\/portals\/export$/, { access: 'staff', roles: GP, module: 'inventory' }]
];

export function findPolicy(method, pathname) {
  const normalized = method === 'HEAD' ? 'GET' : method;
  for (const [verb, pattern, rule] of POLICY) {
    if (verb === normalized && pattern.test(pathname)) return rule;
  }
  return null;
}
