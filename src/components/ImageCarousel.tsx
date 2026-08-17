'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** Show label like "Principal" / "Alt 1" / "Alt 2" */
  showLabels?: boolean;
}

const LABELS = ['Principal', 'Alt. 1', 'Alt. 2', 'Alt. 3', 'Alt. 4'];

export function ImageCarousel({ images, alt, showLabels = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant/40 bg-surface-bright">
        <span className="material-symbols-outlined text-4xl">fitness_center</span>
        <span className="text-label-caps font-bold">SIN IMAGEN</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt={alt}
        className="w-full h-full object-contain"
      />
    );
  }

  const goTo = useCallback((idx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(idx);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, goTo]);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, goTo]);

  // ── Touch / Mouse drag support ──────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (dragOffset < -threshold) next();
    else if (dragOffset > threshold) prev();
    setDragOffset(0);
  };

  const translateX = isDragging ? dragOffset : 0;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-surface-bright" ref={containerRef}>

      {/* Main image with drag */}
      <div
        className="w-full h-full touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt={`${alt} – vista ${currentIndex + 1}`}
          className="w-full h-full object-contain pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(${translateX}px)` }}
          draggable={false}
        />
      </div>

      {/* Label badge */}
      {showLabels && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-surface/50 text-on-surface backdrop-blur-md z-10 border border-outline-variant/30">
          {LABELS[currentIndex] ?? `Alt. ${currentIndex}`}
        </div>
      )}

      {/* Left / Right arrow buttons */}
      <button
        onClick={prev}
        onPointerDown={e => e.stopPropagation()}
        className="
          absolute left-2 top-1/2 -translate-y-1/2 z-20
          w-8 h-8 rounded-full 
          bg-surface/50 hover:bg-surface text-on-surface flex items-center justify-center 
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          md:opacity-0 md:group-hover/carousel:opacity-100
          shadow-sm backdrop-blur-md border border-outline-variant/30
          active:scale-95
        "
        aria-label="Anterior"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
      </button>

      <button
        onClick={next}
        onPointerDown={e => e.stopPropagation()}
        className="
          absolute right-2 top-1/2 -translate-y-1/2 z-20
          w-8 h-8 rounded-full 
          bg-surface/50 hover:bg-surface text-on-surface flex items-center justify-center 
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          md:opacity-0 md:group-hover/carousel:opacity-100
          shadow-sm backdrop-blur-md border border-outline-variant/30
          active:scale-95
        "
        aria-label="Siguiente"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
      </button>

      {/* Thumbnail strip */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 py-2 px-2 bg-gradient-to-t from-background/80 to-transparent z-10 backdrop-blur-[2px]">
        {images.map((src, idx) => (
          <button
            key={idx}
            onClick={e => { e.stopPropagation(); goTo(idx); }}
            onPointerDown={e => e.stopPropagation()}
            className={`
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-md overflow-hidden flex-shrink-0 border
              ${idx === currentIndex
                ? 'border-primary opacity-100 scale-110 shadow-sm'
                : 'border-outline-variant/50 opacity-40 hover:opacity-100 hover:scale-105'
              }
            `}
            style={{ width: 32, height: 24 }}
            aria-label={`Ir a ${LABELS[idx] ?? `imagen ${idx + 1}`}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
