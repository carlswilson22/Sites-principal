export const expenseCategories = {
  compra: 'Compra / aquisição', documentacao: 'Documentação e laudo',
  funilaria: 'Funilaria e pintura', mecanica: 'Mecânica e revisão',
  pecas: 'Peças e pneus', estetica: 'Estética automotiva', outros: 'Outros gastos',
};
const cents = value => Math.round(Number(value) * 100);
const validAmount = value => Number.isFinite(Number(value)) && cents(value) > 0 && Number.isSafeInteger(cents(value));

export function validateExpense(input, vehicleId) {
  if (vehicleId === null || vehicleId === undefined || vehicleId === '') throw new Error('Selecione um veículo para o lançamento.');
  if (!Object.hasOwn(expenseCategories, input.category)) throw new Error('Selecione uma categoria válida.');
  if (!String(input.description || '').trim()) throw new Error('Informe a descrição do gasto.');
  if (!validAmount(input.amount)) throw new Error('Informe um valor maior que zero e válido em centavos.');
  const date = String(input.expense_date || '');
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) throw new Error('Informe uma data válida para o lançamento.');
  return { vehicle_id: vehicleId, category: input.category, description: String(input.description).trim(), amount: cents(input.amount) / 100, expense_date: date };
}

export function summarizeVehicleFinancial(vehicle, records = []) {
  const expenses = records.filter(item => item && String(item.vehicle_id) === String(vehicle?.id) && validAmount(item.amount));
  const purchaseCents = expenses.filter(item => item.category === 'compra').reduce((sum, item) => sum + cents(item.amount), 0);
  const totalCents = expenses.reduce((sum, item) => sum + cents(item.amount), 0);
  const rawPrice = vehicle?.price ?? vehicle?.preco;
  const advertisedPrice = validAmount(rawPrice) ? cents(rawPrice) / 100 : 0;
  const confirmedPrice = [vehicle?.actual_sale_price, vehicle?.sold_price, vehicle?.actualSalePrice].find(validAmount);
  const hasConfirmedSale = vehicle?.status === 'vendido' && validAmount(confirmedPrice);
  const salePrice = hasConfirmedSale ? cents(confirmedPrice) / 100 : Math.max(0, advertisedPrice);
  const hasPurchase = purchaseCents > 0;
  const profit = hasPurchase && salePrice > 0 ? (cents(salePrice) - totalCents) / 100 : null;
  return { expenses, acquisition: purchaseCents / 100, operatingCosts: (totalCents - purchaseCents) / 100, totalCost: totalCents / 100, hasPurchase, salePrice, hasConfirmedSale, profit, marginPct: profit === null ? null : Math.round(profit / salePrice * 10000) / 100 };
}
