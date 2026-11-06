import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, MoveHorizontal, Compass } from 'lucide-react';

export function Vehicle360Viewer({ images, autoRotate = false }) {
  const defaultImages = [
    '/images/cars/sc-001/0.jpg',
    '/images/cars/sc-001/45.jpg',
    '/images/cars/sc-001/90.jpg',
    '/images/cars/sc-001/135.jpg',
    '/images/cars/sc-001/180.jpg',
    '/images/cars/sc-001/225.jpg',
    '/images/cars/sc-001/270.jpg',
    '/images/cars/sc-001/315.jpg'
  ];

  const frameList = images && images.length > 0 ? images : defaultImages;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);
  const containerRef = useRef(null);

  // Auto-rotate suave inicial
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameList.length);
    }, 400);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, frameList.length]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startFrameRef.current = currentFrame;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const framesToMove = Math.floor(deltaX / 25);
    const total = frameList.length;
    const newFrame = (startFrameRef.current - framesToMove) % total;
    setCurrentFrame((newFrame + total) % total);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Suporte a Touch em dispositivos móveis
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startFrameRef.current = currentFrame;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const framesToMove = Math.floor(deltaX / 25);
    const total = frameList.length;
    const newFrame = (startFrameRef.current - framesToMove) % total;
    setCurrentFrame((newFrame + total) % total);
  };

  const angleDegree = Math.round((currentFrame / frameList.length) * 360);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="relative aspect-[16/9] w-full rounded-2xl bg-black border border-amber-500/20 overflow-hidden select-none cursor-grab active:cursor-grabbing group shadow-2xl"
    >
      {/* Imagem do Frame Atual */}
      <img
        src={frameList[currentFrame]}
        alt={`Visualização 360° - Ângulo ${angleDegree}°`}
        className="w-full h-full object-cover pointer-events-none transition-opacity duration-150"
      />

      {/* Overlay com Vinheta de Fundo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Indicador de Ângulo e Bússola */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-mono">
        <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        <span>Ângulo: {angleDegree}°</span>
      </div>

      {/* Badge de Dica de Arraste */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 text-xs shadow-lg">
          <MoveHorizontal className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Arraste para girar 360°</span>
        </div>

        {/* Barra de Progresso de Rotação */}
        <div className="flex gap-1">
          {frameList.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === currentFrame ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
