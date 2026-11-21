// Preserve acquisition attribution while a visitor navigates the store.
export function marketingAttribution() {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const clean = value => String(value || '').trim().slice(0, 120);
    const source = clean(params.get('utm_source'));
    if (source || params.has('utm_campaign')) {
      const attribution = { marketing_source: source || 'Direto', marketing_campaign: clean(params.get('utm_campaign')), marketing_medium: clean(params.get('utm_medium')) };
      sessionStorage.setItem('store_marketing_attribution', JSON.stringify(attribution));
      return attribution;
    }
    const saved = sessionStorage.getItem('store_marketing_attribution');
    if (saved) return JSON.parse(saved);
    const referrer = document.referrer.toLowerCase();
    const attribution = { marketing_source: /instagram|facebook/.test(referrer) ? 'Instagram' : /google\./.test(referrer) ? 'Google' : /olx\./.test(referrer) ? 'OLX' : 'Direto' };
    sessionStorage.setItem('store_marketing_attribution', JSON.stringify(attribution));
    return attribution;
  } catch { return { marketing_source: 'Direto' }; }
}
