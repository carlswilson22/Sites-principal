import { useEffect, useState } from 'react';

// Keep the content available just long enough for the closing transition.
export function useDisclosurePresence(open, duration = 220) {
  const [present, setPresent] = useState(open);

  useEffect(() => {
    if (open) {
      setPresent(true);
      return undefined;
    }
    if (!present) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPresent(false);
      return undefined;
    }
    const timeout = window.setTimeout(() => setPresent(false), duration);
    return () => window.clearTimeout(timeout);
  }, [open, present, duration]);

  return open || present;
}
