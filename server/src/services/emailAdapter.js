/**
 * server/src/services/emailAdapter.js
 * E-mail transacional (Resend). Sem credenciais, informa "nao_configurado": nunca finge envio.
 */
let sender = defaultSender;

async function defaultSender({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { sent: false, status: 'nao_configurado' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to: [to], subject, text })
    });
    return response.ok ? { sent: true, status: 'enviado' } : { sent: false, status: 'erro', httpStatus: response.status };
  } catch {
    return { sent: false, status: 'erro' };
  }
}

export const sendEmail = message => sender(message);

/** Permite trocar o envio em testes. Sem argumento, restaura o padrão. */
export function setEmailSender(fn) { sender = fn || defaultSender; }
