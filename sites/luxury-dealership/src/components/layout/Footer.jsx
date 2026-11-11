import React from 'react';
import { StoreFooter } from '../../../../../packages/merchant-core/src/components/layout/StoreFooter';
import { dealershipInfo } from '../../data/dealershipInfo';
export function Footer({ compact = false }) { return <StoreFooter dealership={dealershipInfo} compact={compact} />; }
