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

Apresente um texto direto em 2 parágrafos enfatizando procedência, revisões e conforto. Finalize com chamada para agendar test drive.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // 2. Modelo de Texto Estruturado (Sem chave externa)
  return `Oportunidade única: ${title} ${version || ''} (${year}), com apenas ${km?.toLocaleString('pt-BR') || 'baixa'} km rodados. Veículo periciado com laudo cautelar 100% aprovado, estrutura íntegra e documentação rigorosamente em dia na elegante cor ${color || 'original'}.

Equipado com transmissão ${transmission || 'automática'} e motorização ${engine || 'econômica'} (${power || 'excelente desempenho'}), oferece dirigibilidade suave e alta eficiência. Conta com ${featuresText}. 

Aceitamos seu veículo seminovo na troca com a melhor avaliação de mercado e oferecemos simulação de financiamento com pré-aprovação rápida. Agende agora seu atendimento exclusivo via WhatsApp!`;
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

