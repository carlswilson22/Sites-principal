/**
 * Envio de fotos: cada imagem é reduzida no navegador (lado maior de 1600 px, JPEG) antes de subir.
 * Fotos de celular de 6 MB viram ~300 KB: o site abre rápido e o limite de 8 MB nunca atrapalha.
 */
const MAX_SIDE: Record<string, number> = { photo: 1600, frame360: 1200 };

async function shrink(file: File, maxSide: number): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob: Blob = await new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('falha ao reduzir'))), 'image/jpeg', 0.85));
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
}

document.querySelectorAll<HTMLFormElement>('form[data-upload]').forEach(form => {
  const input = form.querySelector<HTMLInputElement>('input[type=file]')!;
  const out = form.querySelector<HTMLElement>('[data-progress]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const files = Array.from(input.files || []);
    if (!files.length) { out.textContent = 'Escolha ao menos uma imagem.'; return; }
    const kind = form.dataset.kind || 'photo';
    button.disabled = true;
    let sent = 0;
    const problems: string[] = [];
    for (const [index, file] of files.entries()) {
      out.textContent = `Enviando ${index + 1} de ${files.length}…`;
      try {
        const data = await shrink(file, MAX_SIDE[kind] || 1600);
        const response = await fetch('/acoes/foto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicle_id: Number(form.dataset.vehicle), kind, data }) });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.ok) sent += 1; else problems.push(`${file.name}: ${result.error || 'não foi possível enviar'}`);
      } catch { problems.push(`${file.name}: não é uma imagem válida`); }
    }
    out.textContent = `${sent} de ${files.length} enviadas.${problems.length ? ' ' + problems.join(' | ') : ''}`;
    button.disabled = false;
    if (sent > 0 && !problems.length) location.reload();
  });
});
