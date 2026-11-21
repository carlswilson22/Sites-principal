import React from 'react';
import { AIChatBox } from '../components/ai/AIChatBox';

export function AIConsultantPage({ vehicles, onSelectVehicle, onNavigate }) {
  return <div className="pb-20"><AIChatBox vehicles={vehicles} onSelectVehicle={onSelectVehicle} onNavigate={onNavigate} /></div>;
}
