export const brl = (value: number) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const kmText = (value: number) => `${Number(value || 0).toLocaleString('pt-BR')} km`;

/** Cor do texto sobre a cor da loja, escolhida pelo contraste (WCAG). */
export function textOn(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#ffffff';
  const [r, g, b] = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? '#151a1f' : '#ffffff';
}

/** JSON-LD seguro dentro de <script>: impede que um título com "</script>" feche a tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const DAYS: [string, string][] = [['seg', 'Segunda'], ['ter', 'Terça'], ['qua', 'Quarta'], ['qui', 'Quinta'], ['sex', 'Sexta'], ['sab', 'Sábado'], ['dom', 'Domingo']];
export function hoursRows(hours: Record<string, string> | undefined) {
  const today = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date(Date.now() - 3 * 3600_000).getUTCDay()];
  return DAYS.filter(([key]) => hours && hours[key]).map(([key, label]) => ({ key, label, text: hours![key], today: key === today }));
}

export function whatsappLink(number: string | undefined, text: string) {
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : '';
}

export function vehicleLine(v: any) {
  return [v.year, v.km != null ? kmText(v.km) : '', v.transmission, v.fuel].filter(Boolean);
}
