import { dealershipInfo } from '../data/dealershipInfo';
import { formatCurrency } from './formatters';

export function buildVehicleWhatsappLink(vehicle, phone = dealershipInfo.whatsapp) {
  const text = 
    `🚗 *Olá, AutoElite Motors!*\n\n` +
    `Tenho interesse no seguinte veículo do estoque:\n` +
    `• *Modelo:* ${vehicle.nome} ${vehicle.versao}\n` +
    `• *Ano:* ${vehicle.ano}\n` +
    `• *Km:* ${vehicle.km.toLocaleString('pt-BR')} km\n` +
    `• *Valor à vista:* ${formatCurrency(vehicle.preco)}\n` +
    `• *Laudo:* ${vehicle.laudoCautelar?.status || 'Laudo Cautelar 100% Aprovado'}\n\n` +
    `Gostaria de agendar uma visita e saber mais sobre as condições de negociação.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildFinancingWhatsappLink(vehicle, entrada, prazo, parcela, phone = dealershipInfo.whatsapp) {
  const text = 
    `💰 *Olá, AutoElite Motors!*\n\n` +
    `Fiz uma simulação de financiamento pelo site e gostaria de análise cadastral:\n` +
    `• *Veículo:* ${vehicle ? `${vehicle.nome} ${vehicle.versao}` : 'Seminovos em Geral'}\n` +
    `• *Valor de Entrada:* ${formatCurrency(entrada)}\n` +
    `• *Prazo:* ${prazo}x parcelas\n` +
    `• *Estimativa da Parcela:* ${formatCurrency(parcela)}/mês\n\n` +
    `Poderiam simular com meu CPF junto aos bancos parceiros?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildTradeInWhatsappLink(tradeIn, phone = dealershipInfo.whatsapp) {
  const text = 
    `🔄 *Olá, AutoElite Motors! Proposta de Avaliação de Usado*\n\n` +
    `Gostaria de avaliar meu veículo para dar como entrada:\n` +
    `• *Nome:* ${tradeIn.nome || 'Não informado'}\n` +
    `• *Telefone:* ${tradeIn.telefone || 'Não informado'}\n` +
    `• *Meu Carro Atual:* ${tradeIn.marca} ${tradeIn.modelo} (${tradeIn.ano})\n` +
    `• *Quilometragem:* ${tradeIn.km ? `${tradeIn.km} km` : 'Não informada'}\n` +
    `• *Carro de Interesse na Loja:* ${tradeIn.carroInteresse || 'Quero ver as opções'}\n` +
    (tradeIn.observacoes ? `• *Detalhes:* ${tradeIn.observacoes}\n\n` : `\n`) +
    `Aguardo o retorno para avaliação!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildGeneralWhatsappLink(customMsg = '', phone = dealershipInfo.whatsapp) {
  const defaultText = `👋 Olá, AutoElite Motors! Gostaria de falar com um consultor sobre o estoque de seminovos.`;
  const text = customMsg || defaultText;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
