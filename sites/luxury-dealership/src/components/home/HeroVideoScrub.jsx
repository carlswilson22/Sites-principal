import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const HeroVideoScrub = ({ children }) => {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const videoRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rawBase = import.meta.env.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const posterSrc = `${baseUrl}images/hero-video-poster.jpg`;

  const [videoSrc, setVideoSrc] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return `${baseUrl}videos/${isMobile ? 'hero-scrub-720.mp4' : 'hero-scrub.mp4'}`;
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const targetSrc = `${baseUrl}videos/${isMobile ? 'hero-scrub-720.mp4' : 'hero-scrub.mp4'}`;
      setVideoSrc((prev) => (prev !== targetSrc ? targetSrc : prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [baseUrl]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || hasError) return;

    const video = videoRef.current;
    const container = containerRef.current;
    const pinEl = pinRef.current;
    if (!video || !container || !pinEl) return;

    let targetTime = 0;
    let rafId = null;

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!video || video.seeking) return;
        if (Math.abs(video.currentTime - targetTime) > 0.03) {
          video.currentTime = targetTime;
        }
      });
    };

    const handleSeeked = () => {
      if (!video) return;
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    };

    video.addEventListener('seeked', handleSeeked);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinEl,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const duration = video.duration || 10;
          targetTime = Math.min(Math.max(self.progress * duration, 0), duration);
          scheduleUpdate();
        },
      });
    }, container);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      if (rafId) cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [reducedMotion, hasError, isReady, videoSrc]);

  if (reducedMotion) {
    return (
      <section className="relative min-h-[90vh] overflow-hidden bg-[#050508] flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover filter brightness-[0.3] contrast-125"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
        </div>
        <div className="relative z-20 w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320vh] bg-[#050508]"
      data-testid="hero-video-scrub-container"
    >
      <div
        ref={pinRef}
        className="w-full h-screen relative overflow-hidden flex flex-col justify-center"
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#050508]">
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.35] contrast-110 transition-opacity duration-700 ease-out ${
              isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />

          {!hasError && (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={() => setIsReady(true)}
              onCanPlayThrough={() => setIsReady(true)}
              onError={() => {
                setHasError(true);
                setIsReady(false);
              }}
              className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.35] contrast-115 transition-opacity duration-700 ${
                isReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050508] via-[#050508]/75 to-[#050508]/40 pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-20 w-full pt-28 pb-16 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};
