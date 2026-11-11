import { useEffect, useRef } from 'react';
import { siteAnalytics } from '../services/siteAnalytics.js';

export function useSiteAnalytics(storeKey, page, selectedVehicle) {
  const lastPage = useRef(null);
  const lastVehicle = useRef(null);
  useEffect(() => {
    if (page === 'painel-lojista') { lastPage.current = null; return; }
    const key = `${storeKey}:${page}`;
    if (lastPage.current === key) return;
    lastPage.current = key;
    siteAnalytics.track(storeKey, { type: 'page_view', page });
  }, [storeKey, page]);
  useEffect(() => {
    if (!selectedVehicle) { lastVehicle.current = null; return; }
    const key = `${storeKey}:${selectedVehicle.id}`;
    if (lastVehicle.current === key || page === 'painel-lojista') return;
    lastVehicle.current = key;
    siteAnalytics.track(storeKey, { type: 'vehicle_view', vehicleId: selectedVehicle.id });
  }, [storeKey, page, selectedVehicle]);
  useEffect(() => {
    if (page === 'painel-lojista') return;
    const onClick = event => {
      const anchor = event.target?.closest?.('a[href]');
      if (!anchor || event.defaultPrevented || anchor.getAttribute('aria-disabled') === 'true') return;
      if (new URL(anchor.href).hostname !== 'wa.me') return;
      siteAnalytics.track(storeKey, { type: 'whatsapp_click', page, vehicleId: anchor.closest('[data-vehicle-id]')?.dataset.vehicleId });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [storeKey, page]);
}
