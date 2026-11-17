import React, { createContext, useCallback, useContext, useState } from 'react';

const AdSectionsContext = createContext(null);

export function VehicleAdSections({ children }) {
  const [active, setActive] = useState(null);
  return <AdSectionsContext.Provider value={{ active, setActive }}>
    <div data-ad-sections className="min-w-0 space-y-2">{children}</div>
  </AdSectionsContext.Provider>;
}

// Uma seção aberta por anúncio; os componentes também funcionam isoladamente.
export function useVehicleAdSection(namespace) {
  const context = useContext(AdSectionsContext);
  const [local, setLocal] = useState(null);
  const active = context ? context.active : local;
  const setActive = context ? context.setActive : setLocal;
  const value = active?.namespace === namespace ? active.key : null;
  const setValue = useCallback(next => {
    setActive(previous => {
      const current = previous?.namespace === namespace ? previous.key : null;
      const key = typeof next === 'function' ? next(current) : next;
      if (key != null) return { namespace, key };
      return previous?.namespace === namespace ? null : previous;
    });
  }, [namespace, setActive]);
  return [value, setValue, !!active && active.namespace !== namespace];
}
