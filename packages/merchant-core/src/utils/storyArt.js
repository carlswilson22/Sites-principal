import { resolveAssetUrl } from './assets.js';
import { catalogPhotoCredits } from './catalogPhotoCredits.js';

export const storyTemplates = [
  { id: 'apex_minimal', name: 'Minimalista' },
  { id: 'bold_impact', name: 'Alto contraste' },
  { id: 'showcase_trio', name: 'Editorial · 3 fotos' }
];
export const formatStoryPrice = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function storyPrice(story) {
  if (story.priceMode === 'sem_preco') return 'Consulte condições';
  if (story.priceMode === 'entrada_parcelas') return `Entrada ${formatStoryPrice(story.vehicle.entry)} + 48x de ${formatStoryPrice(story.vehicle.installment)}`;
  return formatStoryPrice(story.vehicle.price);
}
export function storyCredits(photos) {
  return [...new Set(photos)].map(photo => catalogPhotoCredits[photo.match(/\/images\/catalog\/[^?#]+/)?.[0]]).filter(Boolean);
}
const loadImage = source => new Promise((resolve, reject) => {
  const image = new Image();
  const timeout = setTimeout(() => reject(new Error('A foto demorou para carregar. Tente novamente.')), 15000);
  image.crossOrigin = 'anonymous';
  image.onload = () => { clearTimeout(timeout); resolve(image); };
  image.onerror = () => { clearTimeout(timeout); reject(new Error('Não foi possível carregar uma foto da arte. Escolha outra foto e tente novamente.')); };
  image.src = resolveAssetUrl(source);
});
function drawPhoto(ctx, image, x, y, width, height, framing) {
  const ratio = (framing === 'contain' ? Math.min : Math.max)(width / image.width, height / image.height);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
  ctx.drawImage(image, x + (width - image.width * ratio) / 2, y + (height - image.height * ratio) / 2, image.width * ratio, image.height * ratio);
  ctx.restore();
}
function wrap(ctx, text, x, y, width, lineHeight) {
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    for (const chunk of word.length > 90 ? word.match(/.{1,90}/g) : [word]) {
      if (ctx.measureText(`${line} ${chunk}`).width > width && line) { ctx.fillText(line, x, y); y += lineHeight; line = chunk; }
      else line = line ? `${line} ${chunk}` : chunk;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}
export async function createStoryPng(story, canvas = document.createElement('canvas')) {
  const photos = story.template === 'showcase_trio' ? story.photos.slice(0, 3) : story.photos.slice(0, 1);
  const images = await Promise.all(photos.map(loadImage));
  if (!images.length) throw new Error('Selecione ao menos uma foto para criar a arte.');
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Este navegador não conseguiu criar a imagem. Tente em outro navegador.');
  const minimal = story.template === 'apex_minimal';
  ctx.fillStyle = minimal ? '#f2eee7' : '#0f172a'; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = minimal ? '#163b40' : '#a5f3fc'; ctx.font = 'bold 40px Arial';
  wrap(ctx, story.storeName, 64, 92, 950, 48);
  if (story.template === 'showcase_trio') {
    drawPhoto(ctx, images[0], 48, 170, 984, 670, story.framing);
    drawPhoto(ctx, images[1] || images[0], 48, 856, 484, 354, story.framing);
    drawPhoto(ctx, images[2] || images[0], 548, 856, 484, 354, story.framing);
  } else drawPhoto(ctx, images[0], 48, 170, 984, 1040, story.framing);
  ctx.fillStyle = minimal ? '#0f172a' : '#fff';
  ctx.font = minimal ? 'bold 54px Georgia' : 'bold 54px Arial';
  const titleEnd = wrap(ctx, story.vehicle.title.slice(0, 90), 64, 1290, 950, 58);
  ctx.font = '32px Arial'; ctx.fillText(`${story.vehicle.year} · ${Number(story.vehicle.km || 0).toLocaleString('pt-BR')} km`, 64, titleEnd + 12);
  ctx.fillStyle = minimal ? '#163b40' : '#a5f3fc'; ctx.font = 'bold 40px Arial';
  wrap(ctx, storyPrice(story), 64, titleEnd + 84, 950, 48);
  ctx.font = '24px Arial'; ctx.fillText('Saiba mais com a equipe da loja', 64, 1670);
  ctx.fillStyle = minimal ? '#475569' : '#94a3b8'; ctx.font = '14px Arial';
  let footer = 1720;
  for (const credit of storyCredits(photos)) footer = wrap(ctx, `Foto: ${credit.author}. ${credit.license}. Adaptada ao layout. Fonte: ${credit.sourcePage} Licença: ${credit.licenseUrl}`, 64, footer, 950, 18) + 8;
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível exportar a arte.')), 'image/png'));
}
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
