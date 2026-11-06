import { dealershipInfo } from '../data/dealershipInfo';
import { formatCurrency } from './formatters';

export function buildGeneralWhatsappLink(customText) {
  const defaultText = `Olá, gostaria de agendar um atendimento VIP na ${dealershipInfo.nome} e conhecer o acervo exclusivo.`;
  const text = customText || defaultText;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildVehicleWhatsappLink(vehicle) {
  const text = 
    `Olá! Tenho interesse no veículo exclusivo *${vehicle.nome}* (${vehicle.ano}), ` +
    `anunciado por *${formatCurrency(vehicle.preco)}* no showroom da ${dealershipInfo.nome}.\n\n` +
    `Gostaria de mais detalhes sobre procedência, laudo cautelar e agendamento de visita privativa.`;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildFinancingWhatsappLink({ vehicle, vehicleName, valor, entrada, parcelas, valorParcela }) {
  const nomeCarro = vehicle?.nome || vehicleName || 'Superesportivo';
  const text = 
    `🏛️ *Solicitação de Financiamento VIP - ${dealershipInfo.nome}*\n\n` +
    `• *Veículo:* ${nomeCarro}\n` +
    `• *Valor do Veículo:* ${formatCurrency(valor)}\n` +
    `• *Entrada Sugerida:* ${formatCurrency(entrada)}\n` +
    `• *Plano:* ${parcelas}x de ${formatCurrency(valorParcela)}\n\n` +
    `Desejo realizar uma análise de crédito premium com as taxas exclusivas para pessoa física / jurídica.`;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildTradeInWhatsappLink(dadosTroca) {
  const text = 
    `🔄 *Avaliação de Usado / Troca - ${dealershipInfo.nome}*\n\n` +
    `• *Veículo Atual:* ${dadosTroca.marca} ${dadosTroca.modelo} (${dadosTroca.ano})\n` +
    `• *KM:* ${dadosTroca.km} km\n` +
    `• *Blindado:* ${dadosTroca.blindado ? 'Sim' : 'Não'}\n` +
    `• *Veículo de Interesse:* ${dadosTroca.interesse || 'Em aberto no showroom'}\n` +
    `• *Observações:* ${dadosTroca.observacoes || 'Nenhuma'}\n\n` +
    `Gostaria de receber uma estimativa de avaliação prévia.`;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}
