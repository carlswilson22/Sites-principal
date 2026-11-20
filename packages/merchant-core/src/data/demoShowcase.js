/**
 * packages/merchant-core/src/data/demoShowcase.js
 * Dados de exemplo para a APRESENTAÇÃO (modo demonstração): histórico de vendas, tempo em estoque e contatos.
 * Tudo fictício. No modo real nada daqui é usado: os números vêm do servidor da loja.
 *
 * As vendas são de carros que já saíram do estoque, por isso não aparecem na vitrine.
 */

const DAY = 24 * 60 * 60 * 1000;

// Vendas dos últimos 30 dias por loja (daysAgo = há quantos dias foi fechada).
const SALES = {
  autoelite: [
    { model: 'Honda HR-V EXL 2021', value: 112900, daysAgo: 2 },
    { model: 'Chevrolet Onix Premier 2022', value: 84500, daysAgo: 5 },
    { model: 'Jeep Compass Longitude 2021', value: 131000, daysAgo: 9 },
    { model: 'Volkswagen T-Cross 2022', value: 119800, daysAgo: 13 },
    { model: 'Jeep Renegade Sport 2020', value: 89900, daysAgo: 18 },
    { model: 'Nissan Kicks Advance 2022', value: 101500, daysAgo: 24 },
    { model: 'Fiat Argo Drive 2021', value: 62900, daysAgo: 27 }
  ],
  drivenow: [
    { model: 'Audi RS6 Avant 2022', value: 890000, daysAgo: 6 },
    { model: 'Mercedes-AMG C 63 S 2021', value: 640000, daysAgo: 14 },
    { model: 'Porsche Cayenne Turbo 2022', value: 980000, daysAgo: 23 }
  ],
  apexluxury: [
    { model: 'Toyota Corolla XEi 2022', value: 128900, daysAgo: 3 },
    { model: 'Volkswagen Nivus Highline 2023', value: 124500, daysAgo: 8 },
    { model: 'Hyundai Creta Platinum 2022', value: 117900, daysAgo: 12 },
    { model: 'Honda HR-V EXL 2021', value: 119000, daysAgo: 17 },
    { model: 'Jeep Compass Sport 2022', value: 132000, daysAgo: 21 },
    { model: 'Volkswagen T-Cross 2022', value: 109900, daysAgo: 26 },
    { model: 'Nissan Kicks Exclusive 2023', value: 121000, daysAgo: 29 }
  ]
};

// Dias em estoque, repetidos pela ordem do catálogo: alguns carros novos e um ou dois parados (alerta de preço).
const DAYS_IN_STOCK = [12, 34, 8, 71, 45, 23, 88, 5];

// Contatos de exemplo (além dos dois primeiros, que já existiam), com modelos que existem em cada vitrine.
const LEAD_VEHICLES = {
  autoelite: ['Honda Civic G10', 'Volkswagen Polo', 'Toyota Hilux', 'Hyundai HB20', 'BMW 320i', 'Fiat Pulse'],
  drivenow: ['Porsche 911 GT3 RS', 'Ferrari F8 Tributo', 'Lamborghini Huracán EVO', 'Mercedes-AMG G 63 Magno', 'McLaren 720S Spider', 'BMW M4 Competition'],
  apexluxury: ['Jeep Compass', 'Hyundai HB20', 'Volkswagen Polo', 'Fiat Pulse', 'Chevrolet Tracker', 'Toyota Corolla Cross']
};

const LEADS = [
  { name: 'Fernanda Lima', phone: '(61) 99811-2040', source: 'whatsapp_site', status: 'novo', temperature: 'quente', hoursAgo: 1, message: 'Boa tarde! Ainda está disponível? Posso ver hoje à noite?' },
  { name: 'Ricardo Nogueira', phone: '(61) 98122-7788', source: 'simulador_financiamento', status: 'em_atendimento', temperature: 'quente', hoursAgo: 5, message: 'Simulei em 48x com 20% de entrada. Qual a menor parcela possível?' },
  { name: 'Patrícia Gomes', phone: '(61) 99655-3011', source: 'avaliacao_troca', status: 'novo', temperature: 'morno', hoursAgo: 9, message: 'Tenho um carro para dar na troca e quero saber a avaliação.' },
  { name: 'André Carvalho', phone: '(61) 98433-9020', source: 'formulario_site', status: 'em_atendimento', temperature: 'morno', hoursAgo: 30, message: 'Pode me enviar mais fotos e o histórico de revisões?' },
  { name: 'Juliana Prado', phone: '(61) 99277-4410', source: 'formulario_site', status: 'em_atendimento', temperature: 'quente', hoursAgo: 52, message: 'Combinado, passo aí amanhã às 10h para ver o carro.' },
  { name: 'Marcelo Teixeira', phone: '(61) 98890-6123', source: 'whatsapp_site', status: 'ganho', temperature: 'quente', hoursAgo: 96, message: 'Fechado! Vou levar o carro, mando os documentos hoje.' }
];

export function demoSales(storeKey, now = Date.now()) {
  return (SALES[storeKey] || []).map(sale => ({ ...sale, soldAt: new Date(now - sale.daysAgo * DAY).toISOString() }));
}

/** Dias em estoque de exemplo para o veículo na posição `index` do catálogo. */
export function demoDaysInStock(index) {
  return DAYS_IN_STOCK[index % DAYS_IN_STOCK.length];
}

/** Contatos extras de exemplo (ids a partir de 3). */
export function demoLeads(storeKey, now = Date.now()) {
  const names = LEAD_VEHICLES[storeKey] || LEAD_VEHICLES.autoelite;
  return LEADS.map((lead, index) => {
    const { hoursAgo, ...rest } = lead;
    return {
      id: index + 3,
      email: `${lead.name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@exemplo.com.br`,
      vehicleName: names[index % names.length],
      ...rest,
      created_at: new Date(now - hoursAgo * 3600000).toISOString(),
      assignedTo: index % 2 ? 'Marcos Oliveira (Atendente)' : 'Carlos Silva (Proprietário)'
    };
  });
}
