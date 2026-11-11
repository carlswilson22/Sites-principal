import React, { useEffect, useRef, useState } from 'react';
import { VehicleImage } from './VehicleImage';

export function VehicleThumbnails({ images, imageIndex, onSelect, vehicleName }) {
  const stripRef = useRef(null);
  const [visible, setVisible] = useState(() => new Set());
  useEffect(() => {
    if (!stripRef.current) return;
    if (!('IntersectionObserver' in window)) { setVisible(new Set(images)); return; }
    const observer = new IntersectionObserver(entries => {
      const sources = entries.filter(entry => entry.isIntersecting).map(entry => {
        observer.unobserve(entry.target);
        return images[Number(entry.target.dataset.photoIndex)];
      });
      if (sources.length) setVisible(previous => new Set([...previous, ...sources]));
    }, { root: stripRef.current, rootMargin: '0px 48px', threshold: 0.01 });
    stripRef.current.querySelectorAll('[data-photo-index]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [images]);
  if (images.length < 2) return null;
  return <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1 pt-0.5" aria-label="Miniaturas do veículo">
    {images.map((source, index) => <button key={source} type="button" data-photo-index={index} aria-label={`Ver foto ${index + 1} de ${images.length} de ${vehicleName}`} aria-pressed={imageIndex === index} onClick={() => onSelect(index)} className={`relative w-20 sm:w-24 h-14 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 ${imageIndex === index ? 'border-blue-400' : 'border-slate-700 hover:border-slate-400'}`}>
      {visible.has(source) || imageIndex === index ? <VehicleImage src={source} alt={`Miniatura ${index + 1}`} width={96} height={64} fetchPriority="low" className="w-full h-full object-cover" /> : <span aria-hidden="true" className="block w-full h-full bg-slate-800" />}
    </button>)}
  </div>;
}
