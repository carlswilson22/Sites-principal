/** Imprime em um quadro isolado, sem depender da abertura de uma nova janela. */
export function printDocument(html, { title = 'Impressão do documento', onError = () => {} } = {}) {
  if (typeof html !== 'string' || !html.trim()) throw new Error('O documento não está disponível para impressão.');
  const frame = document.createElement('iframe');
  frame.title = title;
  frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;';
  frame.onload = () => {
    try {
      const target = frame.contentWindow;
      if (!target || typeof target.print !== 'function') throw new Error('Impressão indisponível.');
      target.addEventListener('afterprint', () => frame.remove(), { once: true });
      target.focus();
      target.print();
    } catch {
      frame.remove();
      onError('Não foi possível abrir a impressão. Verifique as permissões do navegador e tente novamente.');
    }
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
}
