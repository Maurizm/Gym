'use client';

import { useState } from 'react';

export function ImageCarousel({ images, alt }: { images: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-4xl">🏋️</div>;
  }

  if (images.length === 1) {
    return (
      <img 
        src={images[0]} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
    );
  }

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full group/carousel overflow-hidden">
      <img 
        src={images[currentIndex]} 
        alt={`${alt} - Variante ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500" 
      />
      
      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
        <button 
          onClick={prev}
          className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        <button 
          onClick={next}
          className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
      
      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary' : 'bg-white/40'}`} 
          />
        ))}
      </div>
    </div>
  );
}
