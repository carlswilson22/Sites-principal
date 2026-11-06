import { dealershipInfo } from '../data/dealershipInfo';
import { formatCurrency } from './formatters';

export function buildGeneralWhatsappLink(customText) {
  const defaultText = `Olá! Estive no site da ${dealershipInfo.nome} e gostaria de simular meu financiamento ou tirar dúvidas com um consultor.`;
  const text = customText || defaultText;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildVehicleWhatsappLink(vehicle) {
  const text = 
    `Olá! Vi o *${vehicle.nome}* (${vehicle.ano}) por *${formatCurrency(vehicle.preco)}* no site da ${dealershipInfo.nome}.\n\n` +
    `Gostaria de consultar as condições de financiamento, laudo cautelar e agendar uma visita.`;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildFinancingWhatsappLink({ vehicle, vehicleName, valor, entrada, parcelas, valorParcela }) {
  const nomeCarro = vehicle?.nome || vehicleName || 'Veículo';
  const text = 
    `⚡ *Simulação de Financiamento - ${dealershipInfo.nome}*\n\n` +
    `• *Veículo:* ${nomeCarro}\n` +
    `• *Valor do Carro:* ${formatCurrency(valor)}\n` +
    `• *Entrada:* ${formatCurrency(entrada)}\n` +
    `• *Parcelas:* ${parcelas}x de aproximadamente ${formatCurrency(valorParcela)}\n\n` +
    `Gostaria de dar entrada na aprovação do meu crédito agora!`;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildPriceAlertWhatsappLink({ vehicle, targetPrice, nome, telefone }) {
  const text = 
    `🔔 *Alerta de Queda de Preço - ${dealershipInfo.nome}*\n\n` +
    `• *Cliente:* ${nome}\n` +
    `• *Telefone:* ${telefone}\n` +
    `• *Veículo de Interesse:* ${vehicle.nome} (${vehicle.ano})\n` +
    `• *Preço Atual:* ${formatCurrency(vehicle.preco)}\n` +
    `• *Preço Alvo Desejado:* ${formatCurrency(targetPrice)}\n\n` +
    `Por favor, me avise caso haja uma oportunidade ou condição especial para este modelo!`;
  return `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
}
