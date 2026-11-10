export function validVehiclePrice(vehicle, fallback = 95000) {
  const amount = Number(vehicle?.preco ?? vehicle?.price);
  return Number.isSafeInteger(Math.round(amount * 100)) && amount > 0 ? amount : fallback;
}

const cents = amount => Math.round(amount * 100) / 100;

export function clampDownPayment(amount, price, minimumRatio = 0, maximumRatio = 0.8) {
  const value = Number(amount);
  const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
  const minimum = cents(safePrice * minimumRatio);
  const maximum = cents(safePrice * maximumRatio);
  return cents(Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum)));
}

export function financingPriceBounds(vehicles, selectedVehicle, fallbackPrice = 95000) {
  const prices = [...vehicles, selectedVehicle].filter(Boolean).map(vehicle => validVehiclePrice(vehicle, 0)).filter(price => price > 0);
  if (!prices.length) prices.push(fallbackPrice);
  const minimum = Math.min(10000, ...prices);
  const maximum = Math.ceil(Math.max(250000, ...prices) * 1.25 / 1000) * 1000;
  return { minimum, maximum };
}

export function calculateMonthlyPayment(principal, monthlyRate, term) {
  if (![principal, monthlyRate, term].every(Number.isFinite) || principal <= 0 || monthlyRate < 0 || term <= 0) return 0;
  const payment = monthlyRate === 0 ? principal / term : principal * monthlyRate / -Math.expm1(-term * Math.log1p(monthlyRate));
  return Number.isFinite(payment) ? cents(payment) : 0;
}
