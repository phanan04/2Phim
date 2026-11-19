import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { MovieItem } from '../../types/movie';
import { LandscapeCard } from './LandscapeCard';

interface LandscapeCarouselProps {
  title: string;
  movies: MovieItem[];
  viewAllLink?: string;
  cdnImage?: string;
  badge?: string;
}

export const LandscapeCarousel: React.FC<LandscapeCarouselProps> = ({
  title,
  movies,
  viewAllLink,
  cdnImage,
  badge,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative my-8 select-none group/carousel">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.85)]" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            {title}
            {badge && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 backdrop-blur-md">
                {badge}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs sm:text-sm font-semibold text-white/60 hover:text-white flex items-center gap-1 transition-colors mr-2 px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              <span>Xem tất cả</span>
              <ArrowLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`w-8 h-8 rounded-full liquid-pill flex items-center justify-center transition-all cursor-pointer shadow-md ${
              canScrollPrev ? 'text-white hover:bg-white/20' : 'text-white/30 cursor-not-allowed opacity-40'
            }`}
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`w-8 h-8 rounded-full liquid-pill flex items-center justify-center transition-all cursor-pointer shadow-md ${
              canScrollNext ? 'text-white hover:bg-white/20' : 'text-white/30 cursor-not-allowed opacity-40'
            }`}
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embla Viewport with vertical padding so hover lift is not clipped */}
      <div
        className="overflow-hidden py-6 -my-6 px-1 cursor-grab active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex gap-4 sm:gap-5 touch-pan-y">
          {movies.map((movie) => (
            <div
              key={movie._id || movie.slug}
              className="w-[260px] sm:w-[300px] md:w-[340px] shrink-0"
            >
              <LandscapeCard movie={movie} cdnImage={cdnImage} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
