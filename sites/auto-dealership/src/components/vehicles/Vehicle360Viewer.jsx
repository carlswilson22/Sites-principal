import { VehicleImage } from '../../../../../packages/merchant-core/src/components/common/VehicleImage.jsx';
import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, MoveHorizontal, Compass, Play, Pause } from 'lucide-react';

export function Vehicle360Viewer({ images, autoRotate = false }) {
  const defaultImages = [
    'images/cars/sc-001/0.jpg',
    'images/cars/sc-001/45.jpg',
    'images/cars/sc-001/90.jpg',
    'images/cars/sc-001/135.jpg',
    'images/cars/sc-001/180.jpg',
    'images/cars/sc-001/225.jpg',
    'images/cars/sc-001/270.jpg',
    'images/cars/sc-001/315.jpg'
  ];

  const frameList = images && images.length > 0 ? images : defaultImages;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);
  const containerRef = useRef(null);

  // Auto-rotate suave
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameList.length);
    }, 350);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isDragging, frameList.length]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
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

  // Suporte a Touch
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
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
    <div className="flex flex-col gap-3">
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="relative aspect-[16/9] w-full rounded-2xl bg-slate-900 border border-slate-200/80 overflow-hidden select-none cursor-grab active:cursor-grabbing group shadow-card"
      >
        {/* Imagem do Frame Atual */}
        <VehicleImage
          src={frameList[currentFrame]}
          alt={`Visualização 360° - Ângulo ${angleDegree}°`}
          className="w-full h-full object-cover pointer-events-none transition-opacity duration-150"
        />

        {/* Indicador de Ângulo e Bússola */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-xs font-mono">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Visão Orbital: {angleDegree}°</span>
        </div>

        {/* Badge 360 Oficial */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
          <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
          <span>360° Interativo</span>
        </div>

        {/* Dica de Arraste */}
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs shadow-lg">
            <MoveHorizontal className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Arraste horizontalmente para girar</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlaying(!isAutoPlaying);
            }}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs border border-slate-700 transition-colors shadow-lg"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto Giro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slider de Ângulo */}
      <div className="flex items-center gap-3 px-2">
        <span className="text-xs font-semibold text-slate-500">0°</span>
        <input
          type="range"
          min="0"
          max={frameList.length - 1}
          value={currentFrame}
          onChange={(e) => {
            setIsAutoPlaying(false);
            setCurrentFrame(Number(e.target.value));
          }}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-xs font-semibold text-slate-500">360°</span>
      </div>
    </div>
  );
}

export default Vehicle360Viewer;

