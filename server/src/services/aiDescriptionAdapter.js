/**
 * server/src/services/aiDescriptionAdapter.js
 * Adaptador de IA para Geração de Descrições e Estimativa de Custos Operacionais (I1)
 * 
 * Independente de fornecedor:
 * - Se GEMINI_API_KEY estiver configurada, consome o modelo oficial.
 * - Sem chave configurada, opera com modelo determinístico estruturado de alta conversão.
 * - A descrição gerada é SEMPRE retornada como rascunho para revisão humana do lojista antes de publicar.
 */

export async function generateVehicleDescription(vehicle) {
  const {
    title, version, year, km, transmission, fuel, color, engine, power, features, tags
  } = vehicle;

  const featuresText = Array.isArray(features) && features.length > 0
    ? features.slice(0, 5).join(', ')
    : 'itens de conforto e segurança completos';

  const tagsText = Array.isArray(tags) && tags.length > 0
    ? tags.join(' • ')
    : 'Qualidade Garantida';

  // 1. Caso haja chave Gemini configurada
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Gere uma descrição profissional e envolvente para anúncio de venda do seguinte veículo seminovo:
Modelo: ${title} ${version}
Ano: ${year} | KM: ${km} km | Câmbio: ${transmission} | Combustível: ${fuel} | Cor: ${color}
Motorização: ${engine} (${power})
Destaques e Opcionais: ${featuresText}
Etiquetas: ${tagsText}

Regras: use SOMENTE as informações acima. Não afirme perícia, laudo, revisões, procedência, garantia nem aprovação de crédito. Texto direto em 2 parágrafos, convidando o cliente a falar com a loja.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated) return generated.trim();
      }
    } catch {
      // Fallback transparente
    }
  }

  // 2. Texto de reserva: usa SOMENTE os dados informados. Não afirma perícia, laudo,
  // revisões, procedência nem pré-aprovação de crédito.
  const parts = [];
  parts.push(`${[title, version].filter(Boolean).join(' ')}${year ? `, ano ${year}` : ''}.`);
  const facts = [
    km != null && km !== '' ? `${Number(km).toLocaleString('pt-BR')} km` : null,
    transmission ? `câmbio ${transmission}` : null,
    fuel ? `combustível ${fuel}` : null,
    color ? `cor ${color}` : null,
    engine ? `motor ${engine}${power ? ` (${power})` : ''}` : null
  ].filter(Boolean);
  if (facts.length) parts.push(`Dados: ${facts.join(', ')}.`);
  if (Array.isArray(features) && features.length) parts.push(`Itens informados: ${features.slice(0, 5).join(', ')}.`);
  parts.push('Fale com a loja para conferir as condições e a documentação do veículo.');
  return parts.join(' ');
}

/**
 * Sugestão de Custos Operacionais do Carro (I1)
 * Se o lojista optar por sugestão automática, preenche valores de referência para revisão.
 */
export function estimateVehicleCosts(vehicle) {
  const category = (vehicle.category || 'sedan').toLowerCase();
  const price = parseFloat(vehicle.price) || 80000;

  // Estimativas de referência médias baseadas no segmento
  const costEstimates = {
    hatch: { cityConsumption: 12.5, roadConsumption: 14.8, tankCapacity: 48, avgMaintenance: 650, insurancePct: 0.038 },
    sedan: { cityConsumption: 11.2, roadConsumption: 13.9, tankCapacity: 52, avgMaintenance: 780, insurancePct: 0.035 },
    suv: { cityConsumption: 9.8, roadConsumption: 12.4, tankCapacity: 58, avgMaintenance: 950, insurancePct: 0.042 },
    pickup: { cityConsumption: 8.5, roadConsumption: 10.8, tankCapacity: 75, avgMaintenance: 1400, insurancePct: 0.048 }
  };

  const est = costEstimates[category] || costEstimates.sedan;
  const annualInsurance = Math.round(price * est.insurancePct);

  return {
    cityConsumption: est.cityConsumption,
    roadConsumption: est.roadConsumption,
    tankCapacity: est.tankCapacity,
    avgMaintenance: est.avgMaintenance,
    annualInsurance
  };
}

