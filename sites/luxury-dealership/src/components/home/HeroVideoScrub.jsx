import React from 'react';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroVideoScrub({ children }) {
  return <AnimatedStoreHero tone="amber">{children}</AnimatedStoreHero>;
}
