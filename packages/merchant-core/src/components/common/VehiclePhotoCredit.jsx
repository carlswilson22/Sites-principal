import React from 'react';
import { catalogPhotoCredits } from '../../utils/catalogPhotoCredits';

export function VehiclePhotoCredit({ src }) {
  const path = typeof src === 'string' ? src.split(/[?#]/)[0] : '';
  const entry = Object.entries(catalogPhotoCredits).find(([image]) => path.endsWith(image));
  if (!entry) return null;
  const [, credit] = entry;
  return <p className="text-xs text-slate-400 leading-relaxed">
    Foto ilustrativa do modelo; ano, versão e cor podem variar.{' '}
    <a href={credit.sourcePage} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Foto: {credit.author}</a>
    {' · '}<a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{credit.license}</a>
    {' · '}{credit.resized ? 'Redimensionada, sem outras alterações.' : 'Arquivo original, sem alterações.'}
  </p>;
}
