/**
 * server/src/services/portalExportAdapter.js
 * Adaptador preparado para exportação de catálogo para portais automotivos.
 * 
 * Regra obrigatória: NÃO simula integração com portais de terceiros (OLX, WebMotors, Mercado Livre).
 * Fornece a interface arquitetural e a exportação do estoque em formato padronizado (JSON e CSV).
 */

export function getPortalAdaptersManifest() {
  return {
    disclaimer: 'A publicação direta automatizada em portais (OLX, Mercado Livre, WebMotors) requer contratação de planos de revenda e tokens parceiros oficiais. O sistema disponibiliza o arquivo padronizado de carga e integração.',
    availablePortals: [
      { id: 'olx', name: 'OLX Automóveis', format: 'CSV/XML Carga', status: 'adaptador_pronto' },
      { id: 'webmotors', name: 'WebMotors Pro', format: 'Integrador Estoque', status: 'adaptador_pronto' },
      { id: 'mercadolivre', name: 'Mercado Livre Veículos', format: 'Planilha / API Carga', status: 'adaptador_pronto' }
    ]
  };
}

export function exportVehiclesToCsv(vehicles = []) {
  const headers = [
    'ID', 'Titulo', 'Versao', 'Categoria', 'Ano', 'KM', 'Cambio', 'Combustivel',
    'Cor', 'Portas', 'Preco', 'Tipo_Propriedade', 'Status', 'Dias_Estoque', 'Codigo_FIPE', 'Fotos_Count'
  ];

  const rows = vehicles.map(v => [
    v.id,
    `"${(v.title || '').replace(/"/g, '""')}"`,
    `"${(v.version || '').replace(/"/g, '""')}"`,
    v.category || '',
    v.year || '',
    v.km || 0,
    v.transmission || '',
    v.fuel || '',
    v.color || '',
    v.doors || 4,
    v.price || 0,
    v.ownership_type || 'proprio',
    v.status || 'disponivel',
    v.days_in_stock || 0,
    v.fipe_code || '',
    v.photos_count || 0
  ]);

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
}

export function exportVehiclesToJson(vehicles = [], storeInfo = {}) {
  return {
    generator: 'Auto-Dealership Enterprise / Merchant Core Catalog Export',
    generatedAt: new Date().toISOString(),
    store: storeInfo,
    totalVehicles: vehicles.length,
    vehicles: vehicles.map(v => ({
      id: v.id,
      title: v.title,
      version: v.version,
      category: v.category,
      year: v.year,
      mileageKm: v.km,
      transmission: v.transmission,
      fuel: v.fuel,
      color: v.color,
      doors: v.doors,
      priceBrl: v.price,
      ownershipType: v.ownership_type,
      status: v.status,
      daysInStock: v.days_in_stock,
      fipeReference: {
        code: v.fipe_code,
        price: v.fipe_reference_price
      },
      photos: v.photos || []
    }))
  };
}
