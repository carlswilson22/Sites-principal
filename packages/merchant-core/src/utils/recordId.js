let sequence = 0;

export function createRecordId(provider = globalThis.crypto) {
  if (provider?.randomUUID) return provider.randomUUID();
  if (provider?.getRandomValues) {
    const bytes = provider.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Identificador local para navegadores antigos e acesso HTTP na rede local.
  sequence += 1;
  return `${Date.now().toString(36)}-${sequence.toString(36)}-${Math.random().toString(36).slice(2)}`;
}
