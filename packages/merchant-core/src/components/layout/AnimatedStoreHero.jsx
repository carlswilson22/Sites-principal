import React, { useEffect, useRef, useState } from 'react';
import { VehicleImage } from '../common/VehicleImage';
import { resolveAssetUrl } from '../../utils/assets';
import { subscribeDialogActivity } from '../../utils/dialogActivity';

const tones = {
  blue: { background: 'bg-slate-950', overlay: 'from-slate-950 via-slate-950/80 to-slate-950/65', tint: 'bg-blue-950/10' },
  amber: { background: 'bg-[#050508]', overlay: 'from-[#050508] via-[#050508]/80 to-[#050508]/65', tint: 'bg-amber-950/10' },
  cyan: { background: 'bg-[#070a12]', overlay: 'from-[#070a12] via-[#070a12]/80 to-[#070a12]/65', tint: 'bg-cyan-950/10' },
};

export function AnimatedStoreHero({ children, tone = 'amber' }) {
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
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const screen = window.matchMedia('(max-width: 767px)');
    const update = () => { setReducedMotion(motion.matches); setMobile(screen.matches); };
    update();
    motion.addEventListener('change', update);
    screen.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      screen.removeEventListener('change', update);
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
        const distance = Math.max(container.offsetHeight - content.offsetHeight, 1);
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
  }, [source, showVideo, readySource, dialogOpen]);

  return <section ref={containerRef} data-testid="hero-video-scrub-container" className={`relative ${showVideo ? 'h-[320vh]' : ''} ${palette.background}`}>
    <div ref={contentRef} className={`${showVideo ? 'sticky top-0 min-h-screen' : 'min-h-[65vh] sm:min-h-[70vh]'} relative flex items-center overflow-hidden`}>
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <VehicleImage src={poster} alt="" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
      {showVideo && <video ref={videoRef} key={source} src={source} poster={poster} muted playsInline preload="auto" tabIndex={-1}
        onLoadedMetadata={() => setReadySource(source)}
        onError={() => setFailedSource(source)} className="absolute inset-0 w-full h-full object-cover" />}
      <div className={`absolute inset-0 bg-gradient-to-t ${palette.overlay}`} />
      <div className={`absolute inset-0 ${palette.tint}`} />
    </div>
    <div className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  </section>;
}
