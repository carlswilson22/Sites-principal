import React, { useEffect, useRef, useState } from 'react';
import { VehicleImage } from '../common/VehicleImage';
import { resolveAssetUrl } from '../../utils/assets';
import { subscribeDialogActivity } from '../../utils/dialogActivity';

const tones = {
  blue: { background: 'bg-slate-950' },
  amber: { background: 'bg-[#050508]' },
  cyan: { background: 'bg-[#070a12]' },
};

export function AnimatedStoreHero({ children, tone = 'amber', layout = 'cinema' }) {
  const cinema = layout === 'cinema';
  const [reducedMotion, setReducedMotion] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [readySource, setReadySource] = useState(null);
  const [failedSource, setFailedSource] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const palette = tones[tone] || tones.amber;
  const poster = resolveAssetUrl('/images/hero-video-poster.jpg');
  const source = resolveAssetUrl(`/videos/${mobile ? 'hero-scrub-720.mp4' : 'hero-scrub.mp4'}`);
  const showVideo = !reducedMotion && failedSource !== source;
  useEffect(() => subscribeDialogActivity(setDialogOpen), []);

  useEffect(() => {
    if (!window.matchMedia) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const screen = window.matchMedia('(max-width: 767px)');
    const update = () => { setReducedMotion(motion.matches); setMobile(screen.matches); };
    update();
    const listen = media => media.addEventListener ? media.addEventListener('change', update) : media.addListener?.(update);
    const unlisten = media => media.removeEventListener ? media.removeEventListener('change', update) : media.removeListener?.(update);
    listen(motion);
    listen(screen);
    return () => {
      unlisten(motion);
      unlisten(screen);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const content = contentRef.current;
    if (!video || !container || !content || !showVideo || readySource !== source || dialogOpen) return;
    let frame = null;
    let targetTime = 0;
    const seek = () => {
      if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.03) video.currentTime = targetTime;
    };
    const update = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (!Number.isFinite(video.duration) || !video.duration) return;
        const distance = Math.max(cinema ? container.offsetHeight - content.offsetHeight : container.offsetHeight, 1);
        const progress = Math.min(Math.max(-container.getBoundingClientRect().top / distance, 0), 1);
        targetTime = progress * Math.max(video.duration - 0.05, 0);
        seek();
      });
    };
    video.addEventListener('seeked', seek);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      video.removeEventListener('seeked', seek);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [source, showVideo, readySource, dialogOpen, cinema]);

  return <section ref={containerRef} data-testid="hero-video-scrub-container" className={`relative ${cinema && showVideo ? 'h-[220vh]' : ''} ${!cinema ? 'h-full rounded-3xl overflow-hidden' : ''} ${palette.background}`}>
    <div ref={contentRef} className={`${cinema ? (showVideo ? 'sticky top-0 min-h-screen' : 'min-h-[65vh] sm:min-h-[70vh]') : 'min-h-72 h-full'} relative flex items-center overflow-hidden`}>
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <VehicleImage src={poster} alt="" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
      {showVideo && <video ref={videoRef} key={source} src={source} poster={poster} muted playsInline preload={cinema ? 'auto' : 'metadata'} tabIndex={-1}
        onLoadedMetadata={() => setReadySource(source)}
        onError={() => setFailedSource(source)} className="absolute inset-0 w-full h-full object-cover" />}
      <div className={`absolute inset-0 bg-gradient-to-t ${cinema ? 'from-black/65 via-black/5 to-black/10' : 'from-black/55 via-transparent to-transparent'}`} />
      {cinema && <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />}
    </div>
    <div className={`relative w-full ${cinema ? 'py-16 sm:py-24 px-4 sm:px-6 lg:px-8' : 'p-6 sm:p-8'}`}>{children}</div>
    </div>
  </section>;
}
