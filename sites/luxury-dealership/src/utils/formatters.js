export function formatCurrency(value) {
  if (value === undefined || value === null) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatKm(value) {
  if (value === undefined || value === null) return '0 km';
  if (value === 0) return '0 km (Zero Milha)';
  return `${new Intl.NumberFormat('pt-BR').format(value)} km`;
}

export function formatPower(value) {
  if (!value) return '';
  return `${value} cv`;
}
