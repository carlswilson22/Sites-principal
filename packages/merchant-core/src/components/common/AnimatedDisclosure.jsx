import React from 'react';
import { motion } from 'framer-motion';

// Keep the element mounted through its exit so the height can collapse smoothly.
export function AnimatedDisclosure({ open, present, children, ...props }) {
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  return <motion.div {...props} data-store-disclosure data-open={open}
    hidden={!present} aria-hidden={!open} inert={open ? undefined : ''}
    initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.3 }} style={{ overflow: 'hidden' }}>
    {children}
  </motion.div>;
}
