import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieItem } from '../../types/movie';
import { MovieCard } from './MovieCard';

interface MovieCarouselProps {
  title: string;
  movies: MovieItem[];
  viewAllLink?: string;
  cdnImage?: string;
  badge?: string;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  movies,
  viewAllLink,
  cdnImage,
  badge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative my-8 select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 px-1">
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
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full liquid-pill text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full liquid-pill text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll list with padding to allow center scale pop-out */}
      <div
        ref={containerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto overflow-y-visible no-scrollbar py-4 scroll-smooth snap-x snap-mandatory"
      >
        {movies.map((movie) => (
          <div
            key={movie._id || movie.slug}
            className="w-[155px] sm:w-[185px] md:w-[205px] shrink-0 snap-start"
          >
            <MovieCard movie={movie} cdnImage={cdnImage} />
          </div>
        ))}
      </div>
    </div>
  );
};
