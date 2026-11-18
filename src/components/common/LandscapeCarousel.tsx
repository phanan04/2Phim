import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowLink } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <div className="relative my-8">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-[#FECF59] rounded-full shadow-[0_0_10px_#FECF59]" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {title}
            {badge && (
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FECF59]/20 text-[#FECF59] border border-[#FECF59]/30">
                {badge}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs sm:text-sm font-bold text-white/60 hover:text-[#FECF59] flex items-center gap-0.5 transition-colors mr-2"
            >
              Xem tất cả <ArrowLink className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#18181C] border border-white/10 hover:border-[#FECF59] hover:bg-[#FECF59] hover:text-black text-white/80 transition-all flex items-center justify-center shadow-md"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#18181C] border border-white/10 hover:border-[#FECF59] hover:bg-[#FECF59] hover:text-black text-white/80 transition-all flex items-center justify-center shadow-md"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll list for Landscape Cards */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth snap-x snap-mandatory"
      >
        {movies.map((movie) => (
          <div
            key={movie._id || movie.slug}
            className="w-[260px] sm:w-[300px] md:w-[340px] shrink-0 snap-start"
          >
            <LandscapeCard movie={movie} cdnImage={cdnImage} />
          </div>
        ))}
      </div>
    </div>
  );
};
