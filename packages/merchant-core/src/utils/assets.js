export function resolveAssetUrl(source, base = import.meta.env?.BASE_URL || '/') {
  if (!source || typeof source !== 'string') return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(source)) return source;
  const prefix = `${base.replace(/\/+$/, '')}/`;
  if (prefix !== '/' && source.startsWith(prefix)) return source;
  const match = source.match(/(?:^|\/)(images|videos)\/(.*)$/);
  return match ? `${prefix}${match[1]}/${match[2]}` : source;
}
