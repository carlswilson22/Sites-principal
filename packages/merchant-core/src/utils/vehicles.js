const pairs = {
  title: 'nome', version: 'versao', category: 'categoria', year: 'ano',
  transmission: 'cambio', fuel: 'combustivel', color: 'cor', doors: 'portas',
  engine: 'motor', power: 'potencia', price: 'preco', notes: 'descricao',
  features: 'opcionais', photos: 'imagens', cover_photo: 'imagemPrincipal',
};

export function normalizeVehicle(vehicle) {
  const result = { ...vehicle };
  for (const [panel, site] of Object.entries(pairs)) {
    const fallback = ['features', 'photos'].includes(panel) ? [] : panel === 'price' ? 0 : '';
    result[panel] = result[site] = vehicle[panel] ?? vehicle[site] ?? fallback;
  }
  result.title = result.nome = String(result.title);
  result.version = result.versao = String(result.version);
  result.color = result.cor = String(result.color);
  result.price = result.preco = Number(result.price) || 0;
  result.km = Math.max(0, Number(result.km) || 0);
  result.photos = result.imagens = Array.isArray(result.photos) ? result.photos : [];
  result.features = result.opcionais = Array.isArray(result.features) ? result.features : [];
  result.cover_photo = result.imagemPrincipal = result.cover_photo || result.photos[0] || '/images/placeholder-carro.jpg';
  result.status = result.status || 'disponivel';
  result.ownership_type = result.ownership_type || 'proprio';
  result.is_published = [0, false, '0'].includes(result.is_published) ? 0 : 1;
  result.days_in_stock = Number(result.days_in_stock) || 0;
  result.tags = Array.isArray(result.tags) ? result.tags : [];
  result.marca = result.marca || result.title.split(' ')[0];
  return result;
}

export function isPublishedVehicle(vehicle) {
  return ![0, false, '0'].includes(vehicle.is_published) && vehicle.status !== 'vendido';
}
