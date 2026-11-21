import React from 'react';
import { ModalTransition } from './ModalTransition';
import './merchantModalTransition.css';

export function MerchantModalTransition(props) {
  return <ModalTransition kind="merchant" {...props} />;
}
