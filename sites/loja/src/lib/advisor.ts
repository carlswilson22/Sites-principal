/**
 * Consultor virtual: sugestões por regras simples e transparentes, a partir do estoque de hoje.
 * Não usa IA e não inventa nada: cada motivo exibido vem de um dado real do veículo ou do que o visitante escolheu.
 */
import { brl } from './format';

export type Need = 'cidade' | 'familia' | 'viagem' | 'trabalho' | 'primeiro';
export const NEEDS: Record<Need, string> = {
  cidade: 'Uso na cidade', familia: 'Família', viagem: 'Viagens', trabalho: 'Trabalho e carga', primeiro: 'Primeiro carro'
};
const WEIGHT: Record<Need, Record<string, number>> = {
  cidade: { hatch: 3, sedan: 2, suv: 1 },
  familia: { suv: 3, sedan: 3, pickup: 1, picape: 1, hatch: 1 },
  viagem: { sedan: 3, suv: 3, pickup: 2, picape: 2, hatch: 1 },
  trabalho: { pickup: 3, picape: 3, suv: 1 },
  primeiro: { hatch: 3, sedan: 1 }
};
const CATEGORY: Record<string, string> = { sedan: 'sedã', hatch: 'hatch', suv: 'SUV', pickup: 'picape', picape: 'picape', esportivo: 'esportivo' };

export interface Pick { v: any; reasons: string[]; score: number }

export function advise(vehicles: any[], { budget, need, gearbox }: { budget: number; need?: Need; gearbox?: 'automatico' | 'manual' | '' }, limit = 6): Pick[] {
  const picks: Pick[] = [];
  for (const v of vehicles) {
    if (budget > 0 && v.price > budget) continue;
    // O que o visitante pediu de forma explícita (câmbio) é filtro, não só pontuação.
    const isAuto = /autom|cvt/i.test(String(v.transmission || ''));
    if (gearbox === 'automatico' && !isAuto) continue;
    if (gearbox === 'manual' && (isAuto || !v.transmission)) continue;
    let score = 0;
    const reasons: string[] = [];
    if (budget > 0) {
      reasons.push(`Cabe no orçamento: ${brl(budget - v.price)} abaixo do limite`);
      score += Math.max(0, 1 - (budget - v.price) / budget);
    }
    if (need && WEIGHT[need]) {
      const w = WEIGHT[need][String(v.category)] || 0;
      score += w;
      if (w >= 2) reasons.push(`O perfil ${CATEGORY[v.category] || v.category} costuma combinar com ${NEEDS[need].toLowerCase()}`);
    }
    const auto = /autom|cvt/i.test(String(v.transmission || ''));
    if (gearbox === 'automatico' && auto) { score += 2; reasons.push('Câmbio automático'); }
    if (gearbox === 'manual' && !auto && v.transmission) { score += 2; reasons.push('Câmbio manual'); }
    if (Number.isFinite(v.km) && v.km < 50000) { score += 1; reasons.push(`Quilometragem baixa: ${Number(v.km).toLocaleString('pt-BR')} km`); }
    score += (parseInt(String(v.year), 10) - 2000) / 100;
    picks.push({ v, reasons, score });
  }
  return picks.sort((a, b) => b.score - a.score).slice(0, limit);
}
