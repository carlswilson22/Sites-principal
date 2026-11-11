import React from 'react';
import { StoreHighlights } from '../../../../../packages/merchant-core/src/components/layout/StoreHighlights';
import { dealershipInfo } from '../../data/dealershipInfo';
export function StatsSection({ vehicles = [] }) { return <StoreHighlights dealership={dealershipInfo} vehicles={vehicles} />; }
