import React, { useState, useCallback } from 'react';

interface PhotoCarouselProps {
  photos: Array<{
    url: string;
    thumbnailUrl?: string | null;
    fileName?: string;
  }>;
  className?: string;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, photos.length - 1)));
  }, [photos.length]);

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  const openInNewTab = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  if (photos.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-2">📷</div>
          <p className="text-sm">Sin fotos de evidencia</p>
        </div>
      </div>
    );
  }

  const current = photos[currentIndex];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main image */}
      <div className="relative group rounded-xl overflow-hidden bg-gray-900 aspect-[4/3]">
        <img
          src={current.url}
          alt={current.fileName || `Foto ${currentIndex + 1}`}
          className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
          onClick={() => openInNewTab(current.url)}
        />

        {/* Open in new tab overlay */}
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
          onClick={() => openInNewTab(current.url)}
        >
          <span className="bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow">
            🔍 Ver en nueva pestaña
          </span>
        </div>

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-700 shadow transition-all disabled:opacity-30"
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              disabled={currentIndex === photos.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-700 shadow transition-all disabled:opacity-30"
            >
              →
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${index === currentIndex
                  ? 'border-emerald-500 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                }
              `}
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.fileName || `Thumb ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoCarousel;
