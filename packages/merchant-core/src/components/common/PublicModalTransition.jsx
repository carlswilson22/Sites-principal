import React from 'react';
import { ModalTransition } from './ModalTransition';
import './publicModalTransition.css';

export function PublicModalTransition(props) {
  return <ModalTransition kind="public" {...props} />;
}
