import { useEffect, useRef, useState } from 'react';
import { calculateMonthlyPayment, clampDownPayment, financingPriceBounds, validVehiclePrice } from '../utils/financingSimulation.js';

const sameId = (first, second) => first != null && second != null && String(first) === String(second);

export function useFinancingSimulation({ vehicles, preselectedVehicle, fallbackPrice, downPaymentRatio, minimumDownPaymentRatio, monthlyRate }) {
  const initialVehicle = vehicles.find(vehicle => sameId(vehicle.id, preselectedVehicle?.id)) || preselectedVehicle || vehicles[0] || null;
  const createSelection = vehicle => {
    const price = validVehiclePrice(vehicle, fallbackPrice);
    return { selectedVehicle: vehicle, price, downPayment: clampDownPayment(price * downPaymentRatio, price, minimumDownPaymentRatio) };
  };
  const [simulation, setSimulation] = useState(() => createSelection(initialVehicle));
  const [term, setTerm] = useState(48);
  const requestedSelection = `${preselectedVehicle?.id ?? ''}:${preselectedVehicle?.preco ?? preselectedVehicle?.price ?? ''}`;
  const lastRequestedSelection = useRef(requestedSelection);

  useEffect(() => {
    const selectionChanged = lastRequestedSelection.current !== requestedSelection;
    lastRequestedSelection.current = requestedSelection;
    setSimulation(current => {
      const matchingVehicle = vehicles.find(vehicle => sameId(vehicle.id, current.selectedVehicle?.id));
      const nextVehicle = selectionChanged ? initialVehicle : matchingVehicle || initialVehicle;
      const sameVehicle = sameId(nextVehicle?.id, current.selectedVehicle?.id) || nextVehicle === current.selectedVehicle;
      if (!sameVehicle || validVehiclePrice(nextVehicle, fallbackPrice) !== validVehiclePrice(current.selectedVehicle, fallbackPrice)) {
        return createSelection(nextVehicle);
      }
      return nextVehicle === current.selectedVehicle ? current : { ...current, selectedVehicle: nextVehicle };
    });
  }, [vehicles, preselectedVehicle, requestedSelection, fallbackPrice, downPaymentRatio, minimumDownPaymentRatio]);

  const bounds = financingPriceBounds(vehicles, simulation.selectedVehicle, fallbackPrice);
  const setPrice = amount => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) return;
    const price = Math.min(bounds.maximum, Math.max(bounds.minimum, parsed));
    setSimulation(current => ({ ...current, price, downPayment: clampDownPayment(current.downPayment, price, minimumDownPaymentRatio) }));
  };
  const setDownPayment = amount => setSimulation(current => ({ ...current, downPayment: clampDownPayment(amount, current.price, minimumDownPaymentRatio) }));
  const selectVehicle = id => {
    const vehicle = vehicles.find(item => sameId(item.id, id));
    if (vehicle) setSimulation(createSelection(vehicle));
  };
  const financedAmount = Math.max(simulation.price - simulation.downPayment, 0);
  return { ...simulation, setPrice, setDownPayment, selectVehicle, term, setTerm, bounds, financedAmount,
    monthlyPayment: calculateMonthlyPayment(financedAmount, monthlyRate, term),
    minimumDownPayment: Math.round(simulation.price * minimumDownPaymentRatio * 100) / 100,
    maximumDownPayment: Math.round(simulation.price * 0.8 * 100) / 100,
  };
}
