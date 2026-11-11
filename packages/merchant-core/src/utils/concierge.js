import { isPublishedVehicle } from './vehicles.js';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function conciergeReply(message, vehicles = [], dealership = {}, vehicle = null) {
  const query = normalize(message);
  if (/funcionario|pessoa|humano|vendedor|whatsapp/.test(query)) return { text: 'Para conversar com um funcionário, use “Falar com a equipe no WhatsApp”. Você decide quando continuar por lá.', action: 'human' };
  if (/horario|endereco|localiza|onde fica|showroom/.test(query)) {
    const address = dealership.endereco || {};
    return { text: `${dealership.nome}: ${[address.logradouro, address.bairro, address.cidade, address.uf].filter(Boolean).join(', ')}. ${Object.values(dealership.horarios || {}).join('. ')}.`, action: 'visit' };
  }
  if (/visita|agendar|test.?drive/.test(query)) return { text: `Combine o dia e horário diretamente com o lojista pelo WhatsApp${vehicle ? ` para conhecer o ${vehicle.nome || vehicle.title}` : ''}. Use a opção abaixo para continuar com a equipe.`, action: 'visit' };
  if (/financia|parcela|entrada|simula/.test(query)) return { text: vehicle ? 'O simulador está no final deste anúncio. Ajuste entrada, prazo e taxa para consultar uma estimativa, sem sair daqui.' : 'Abra um anúncio e escolha “Simular financiamento deste veículo”. Você ajusta entrada, prazo e taxa sem sair do anúncio.', action: vehicle ? 'financing' : 'inventory' };
  if (vehicle) {
    const name = vehicle.nome || vehicle.title;
    const money = Number(vehicle.preco ?? vehicle.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (/preco|valor|custa/.test(query)) return { text: `O valor anunciado do ${name} é ${money}. Condições de negociação precisam ser confirmadas com um funcionário da loja.` };
    if (/laudo|pericia|procedencia|sinistro/.test(query)) return { text: vehicle.laudoCautelar?.status ? `Laudo cadastrado para o ${name}: ${vehicle.laudoCautelar.status}. Consulte os detalhes do laudo neste anúncio e confirme a documentação com a loja.` : 'Este anúncio não tem um status de laudo informado. A equipe da loja pode confirmar a documentação e a procedência.' };
    if (/detalhe|ficha|motor|potencia|combustivel|quilomet|\bkm\b|\bano\b|\bcor\b|cambio/.test(query)) {
      const facts = [['Ano', vehicle.ano || vehicle.year], ['Quilometragem', vehicle.km != null ? `${Number(vehicle.km).toLocaleString('pt-BR')} km` : null], ['Motor', vehicle.motor || vehicle.engine], ['Potência', vehicle.potencia || vehicle.power], ['Combustível', vehicle.combustivel || vehicle.fuel], ['Cor', vehicle.cor || vehicle.color]];
      return { text: `${name}\n${facts.filter(([, value]) => value != null && value !== '').map(([label, value]) => `${label}: ${value}`).join('\n')}` };
    }
    return { text: `Estamos falando do ${name}. Posso consultar os dados deste anúncio, orientar a simulação de financiamento ou preparar um pedido de visita. Para condições especiais, use a opção de falar com um funcionário.` };
  }
  const budgetMatch = query.match(/(?:ate|orcamento|limite|r\$)\s*([\d.,]+)\s*(mil|milhao|milhoes|k)?/);
  let budget = null;
  if (budgetMatch) {
    const value = Number(budgetMatch[1].replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.'));
    budget = value * (/milhao|milhoes/.test(budgetMatch[2]) ? 1000000 : /mil|k/.test(budgetMatch[2]) ? 1000 : 1);
  }
  const category = query.match(/\b(suv|sedan|hatch|picape|pickup)\b/)?.[1];
  const automatic = /automatic|automati|cvt/.test(query);
  const publicVehicles = vehicles.filter(isPublishedVehicle);
  const tokens = query.split(/\W+/).filter(token => token.length > 2);
  const named = publicVehicles.filter(vehicle => tokens.some(token => normalize(vehicle.nome || vehicle.title).split(/\W+/).includes(token)));
  let matches = (named.length ? named : publicVehicles).filter(vehicle => {
    const value = Number(vehicle.preco ?? vehicle.price);
    const vehicleCategory = normalize(vehicle.categoria || vehicle.category).replace('pickup', 'picape').replace(/^seda$/, 'sedan');
    return (!budget || value <= budget)
      && (!category || vehicleCategory.includes(category === 'pickup' ? 'picape' : category))
      && (!automatic || /automat|cvt/.test(normalize(vehicle.cambio || vehicle.transmission)));
  });
  if (budget || category || automatic || named.length || /carro|veiculo|estoque|opcao|opcoes|procur|compr/.test(query)) {
    matches = matches.sort((a, b) => Number(a.preco ?? a.price) - Number(b.preco ?? b.price)).slice(0, 3);
    return matches.length
      ? { text: 'Estas opções do estoque combinam com o que você informou. Abra o anúncio para ver as fotos, os detalhes e simular as parcelas.', vehicleIds: matches.map(vehicle => vehicle.id) }
      : { text: 'Não encontrei opções cadastradas com esses critérios. Você pode ajustar o orçamento ou registrar sua preferência para conversar com a loja.', action: 'request' };
  }
  return { text: 'Posso consultar veículos por modelo, categoria ou orçamento e orientar uma simulação. Por exemplo: “Quero um SUV até 150 mil”. Para combinar uma visita, converse com o lojista pelo WhatsApp.', action: 'inventory' };
}

export function validateStoreRequest({ name, phone }) {
  if (String(name || '').trim().length < 2) throw new Error('Informe seu nome.');
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) throw new Error('Informe um telefone com DDD.');
  return { name: name.trim(), phone: phone.trim() };
}
