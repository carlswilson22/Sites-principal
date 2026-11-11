import React from 'react';
import { StoreLogo } from '../../../../../packages/merchant-core/src/components/layout/StoreLogo';
import { dealershipInfo } from '../../data/dealershipInfo';
export default function AutomatchLogo(props) { return <StoreLogo {...props} name={dealershipInfo.nome} />; }
export { AutomatchLogo as AutoDealershipLogo };
