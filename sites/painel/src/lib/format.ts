export const brl = (value: number) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const kmText = (value: number) => `${Number(value || 0).toLocaleString('pt-BR')} km`;

/** Datas da API (UTC, "AAAA-MM-DD HH:MM:SS" ou ISO) no horário de Brasília. */
export function when(value: string | null | undefined): string {
  if (!value) return '—';
  const iso = String(value).includes('T') ? String(value) : `${String(value).replace(' ', 'T')}Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function whatsappHref(phone: string | null | undefined): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10) return '';
  return `https://wa.me/${digits.length <= 11 ? '55' + digits : digits}`;
}

export const SOURCE_LABEL: Record<string, string> = {
  site_formulario: 'Formulário do site', site_whatsapp: 'WhatsApp do site', simulador_financiamento: 'Simulador de financiamento', avaliacao_troca: 'Troca Fácil'
};
export const STATUS_LABEL: Record<string, string> = { novo: 'Novo', em_atendimento: 'Em atendimento', ganho: 'Venda fechada', perdido: 'Perdido' };
export const VEHICLE_STATUS: Record<string, string> = { disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido' };
export const OWNERSHIP: Record<string, string> = { proprio: 'Próprio', consignado: 'Consignado', parceiro: 'Parceiro' };
export const ROLE_LABEL: Record<string, string> = { proprietario: 'Proprietário', gerente: 'Gerente', atendente: 'Atendente' };
