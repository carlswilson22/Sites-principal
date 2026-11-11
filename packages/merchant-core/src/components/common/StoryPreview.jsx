import React from 'react';
import { resolveAssetUrl } from '../../utils/assets.js';
import { storyCredits, storyPrice } from '../../utils/storyArt.js';

export function StoryPreview({ story }) {
  const minimal = story.template === 'apex_minimal';
  const photos = (story.template === 'showcase_trio' ? [story.photos[0], story.photos[1] || story.photos[0], story.photos[2] || story.photos[0]] : story.photos.slice(0, 1)).filter(Boolean);
  return <div data-story-template={story.template} className={`aspect-[9/16] w-full max-w-[324px] p-4 flex flex-col gap-3 overflow-hidden ${minimal ? 'bg-[#f2eee7] text-slate-900' : 'bg-slate-900 text-white'}`}>
    <p className={`text-xs font-bold uppercase tracking-widest ${minimal ? 'text-teal-900' : 'text-cyan-200'}`}>{story.storeName}</p>
    <div className={`min-h-0 flex-1 grid gap-1 ${photos.length > 1 ? 'grid-cols-2 grid-rows-[2fr_1fr]' : ''}`}>
      {photos.map((photo, index) => <img key={`${photo}-${index}`} src={resolveAssetUrl(photo)} alt={`${story.vehicle.title} · foto ${index + 1}`} className={`w-full h-full min-h-0 ${index === 0 && photos.length > 1 ? 'col-span-2' : ''} ${story.framing === 'contain' ? 'object-contain' : 'object-cover'}`} />)}
    </div>
    <div className="space-y-1"><h3 className={`text-xl leading-tight font-bold break-words ${minimal ? 'font-serif' : ''}`}>{story.vehicle.title}</h3><p className="text-[10px] opacity-75">{story.vehicle.year} · {Number(story.vehicle.km || 0).toLocaleString('pt-BR')} km</p><p className={`text-sm font-bold ${minimal ? 'text-teal-900' : 'text-cyan-200'}`}>{storyPrice(story)}</p></div>
    <p className="text-[9px]">Saiba mais com a equipe da loja</p>
    {storyCredits(photos).length > 0 && <div className="text-[7px] opacity-75">{storyCredits(photos).map((credit, index) => <p key={index}><a href={credit.sourcePage} target="_blank" rel="noreferrer">Foto: {credit.author}</a> · <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a> · Adaptada ao layout</p>)}</div>}
  </div>;
}
