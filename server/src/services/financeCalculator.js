/**
 * server/src/services/financeCalculator.js
 * Motor de Cálculo Financeiro: Tabela Price com juros compostos em decimal (BRL).
 * 
 * Fórmula Price:
 * PMT = PV * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
 * Onde:
 * PV = Valor Presente (Valor financiado = Preço do Veículo - Entrada)
 * i  = Taxa de juros mensal (ex: 1.49% a.m. -> 0.0149)
 * n  = Número de parcelas (ex: 12, 24, 36, 48, 60)
 */

export function calculatePriceFinancing({ vehiclePrice, downPayment, months, monthlyInterestRate }) {
  const price = parseFloat(vehiclePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const n = parseInt(months, 10) || 48;
  const requestedRate = Number(monthlyInterestRate ?? 1.49);
  const i = Number.isFinite(requestedRate) && requestedRate >= 0 ? requestedRate / 100 : 0.0149;

  const principal = Math.max(0, price - down);
  if (principal === 0 || n <= 0) {
    return {
      principal: 0,
      installmentValue: 0,
      totalPaid: down,
      totalInterest: 0,
      months: n,
      disclaimer: 'Simulação preliminar sujeita à análise de crédito bancária.'
    };
  }

  // Se taxa for zero (promoção taxa zero)
  if (i === 0) {
    const installmentValue = Math.round((principal / n) * 100) / 100;
    return {
      principal,
      installmentValue,
      totalPaid: down + principal,
      totalInterest: 0,
      months: n,
      disclaimer: 'Simulação sem juros sujeita à aprovação bancária.'
    };
  }

  // Tabela Price padrão
  const factor = Math.pow(1 + i, n);
  const pmt = principal * ((i * factor) / (factor - 1));
  const installmentValue = Math.round(pmt * 100) / 100;
  const totalPaid = Math.round((down + (installmentValue * n)) * 100) / 100;
  const totalInterest = Math.round((totalPaid - price) * 100) / 100;

  return {
    vehiclePrice: price,
    downPayment: down,
    principal,
    installmentValue,
    totalPaid,
    totalInterest,
    months: n,
    monthlyRatePct: Math.round(i * 10000) / 100,
    disclaimer: 'Valores aproximados calculados pela Tabela Price. Sujeito à análise de crédito e inclusão de taxas de cadastro/IOF pelo banco financiador.'
  };
}

