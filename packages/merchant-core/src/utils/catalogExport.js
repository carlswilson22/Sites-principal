/**
 * Exportacao compartilhada do catalogo
 * Adaptador preparado para exportação de catálogo para portais automotivos.
 *
 * Regra obrigatória: NÃO simula integração com portais de terceiros (OLX, WebMotors, Mercado Livre).
 * Fornece a interface arquitetural e a exportação do estoque em formato padronizado (JSON e CSV).
 */

export function getPortalAdaptersManifest() {
  return {
    disclaimer: 'Este arquivo é um catálogo genérico do estoque (CSV e JSON). Ele não está no layout de nenhum portal específico e não publica nada em portais. Para anunciar em OLX, WebMotors, Mercado Livre ou similares, é preciso contrato com o portal e, quando houver, integração própria (serviço à parte).',
    formats: ['csv', 'json'],
    availablePortals: []
  };
}

export function exportVehiclesToCsv(vehicles = []) {
  const headers = [
    'ID', 'Titulo', 'Versao', 'Categoria', 'Ano', 'KM', 'Cambio', 'Combustivel',
    'Cor', 'Portas', 'Preco', 'Tipo_Propriedade', 'Status', 'Dias_Estoque', 'Codigo_FIPE', 'Fotos_Count'
  ];

  const rows = vehicles.map(v => [
    v.id,
    v.title || '',
    v.version || '',
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

  const cell = value => {
    const text = String(value ?? '');
    const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return [headers.join(';'), ...rows.map(row => row.map(cell).join(';'))].join('\r\n');
}

export function exportVehiclesToJson(vehicles = [], storeInfo = {}) {
  return {
    generator: 'Catálogo de estoque (exportação genérica)',
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
