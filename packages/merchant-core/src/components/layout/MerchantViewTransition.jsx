import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { canAccessMerchantRoute } from '../../utils/merchantAccess';

const TRANSITION_MS = 300;

/** Mantém somente uma ferramenta montada enquanto sua saída é animada. */
export function MerchantViewTransition({ active, tier, role, children }) {
  const [state, setState] = useState(() => ({ visible: active, phase: 'open' }));
  const { visible, phase } = state;
  const accessible = canAccessMerchantRoute(visible, tier, role);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    // Uma mudança de perfil não deve manter uma ferramenta sem autorização na tela.
    if (reducedMotion || !accessible) {
      if (visible !== active || phase !== 'open') setState({ visible: active, phase: 'open' });
      return undefined;
    }

    if (visible !== active) {
      // Se a área já estiver fechada, utilize a escolha mais recente imediatamente.
      if (phase === 'closed') {
        setState({ visible: active, phase: 'closed' });
        return undefined;
      }
      if (phase !== 'closing') {
        setState(previous => ({ ...previous, phase: 'closing' }));
        return undefined;
      }
      const timer = window.setTimeout(() => setState({ visible: active, phase: 'closed' }), TRANSITION_MS);
      return () => window.clearTimeout(timer);
    }

    // Voltar rapidamente à ferramenta anterior reverte o fechamento em andamento.
    if (phase === 'closing') {
      setState(previous => ({ ...previous, phase: 'entering' }));
      return undefined;
    }
    if (phase === 'closed') {
      let secondFrame;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setState(previous => ({ ...previous, phase: 'entering' }));
        });
      });
      return () => {
        window.cancelAnimationFrame(firstFrame);
        if (secondFrame != null) window.cancelAnimationFrame(secondFrame);
      };
    }
    if (phase === 'entering') {
      const timer = window.setTimeout(() => setState(previous => ({ ...previous, phase: 'open' })), TRANSITION_MS);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [active, accessible, phase, visible]);

  // Não exponha conteúdo de uma ferramenta cuja permissão acabou de ser removida.
  const rendered = accessible ? visible : active;
  const collapsed = accessible && (phase === 'closing' || phase === 'closed');
  const inactive = accessible && (visible !== active || collapsed);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  return <motion.div data-merchant-view={rendered} data-phase={accessible ? phase : 'open'} aria-hidden={inactive} inert={inactive ? '' : undefined}
    initial={false} animate={{ height: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
    transition={{ duration: reducedMotion ? 0 : TRANSITION_MS / 1000, ease: [0.4, 0, 0.2, 1] }}>
    <div className="merchant-view-inner">{children(rendered)}</div>
  </motion.div>;
}
