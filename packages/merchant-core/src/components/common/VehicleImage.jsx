import React, { useState } from 'react';
import { resolveAssetUrl } from '../../utils/assets';

export function VehicleImage({ src, alt = '', onError, fetchPriority, decoding = 'async', ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const fallback = resolveAssetUrl('/images/placeholder-carro.jpg');
  const resolved = resolveAssetUrl(src) || fallback;
  const current = failedSource === resolved ? fallback : resolved;
  return <img {...props} decoding={decoding} fetchpriority={fetchPriority} alt={alt} src={current} onError={event => {
    if (current !== fallback) setFailedSource(resolved);
    onError?.(event);
  }} />;
}
