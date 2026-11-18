import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';

interface TopTenCarouselProps {
  movies: MovieItem[];
  cdnImage?: string;
}

export const TopTenCarousel: React.FC<TopTenCarouselProps> = ({ movies, cdnImage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const top10 = movies.slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!top10 || top10.length === 0) return null;

  return (
    <div className="relative my-10">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#FECF59] rounded-full shadow-[0_0_10px_#FECF59]" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Top 10 Thịnh Hành Hôm Nay
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FECF59]/20 text-[#FECF59] border border-[#FECF59]/30">
              TOP 10
            </span>
          </h2>
        </div>

        {/* Navigation arrow buttons */}
        <div className="flex items-center gap-2">
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

      {/* Horizontal List with Giant Number Ranking - Locked Height & Zero Wobble */}
      <div
        ref={containerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden no-scrollbar h-[280px] sm:h-[305px] py-2 scroll-smooth select-none items-center"
      >
        {top10.map((movie, index) => {
          const rank = index + 1;
          const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url, cdnImage);

          return (
            <div
              key={movie._id || movie.slug}
              className="relative shrink-0 select-none group w-[210px] sm:w-[230px] h-full flex items-center"
            >
              {/* Giant 3D Outline Number - Absolutely Anchored to Bottom Left */}
              <div className="absolute left-0 bottom-2 z-0 pointer-events-none select-none">
                <span
                  className={`text-[120px] sm:text-[140px] font-black leading-none ${
                    rank <= 3 ? 'outline-number-active' : 'outline-number'
                  }`}
                >
                  {rank}
                </span>
              </div>

              {/* Poster Card (TV360 Style) - Fixed Offset from Number */}
              <Link
                to={`/phim/${movie.slug}`}
                className="ml-14 sm:ml-16 relative z-10 w-[145px] sm:w-[160px] aspect-[2/3] rounded-xl overflow-hidden bg-[#16161C] border border-white/10 group-hover:border-[#FECF59] transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.8),0_0_20px_rgba(254,207,89,0.3)] block"
              >
                <img
                  src={posterUrl}
                  alt={movie.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />

                {/* TV360 Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  {rank <= 3 ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#E50914] text-white shadow-md flex items-center gap-1">
                      👑 VIP
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md">
                      TOP {rank}
                    </span>
                  )}

                  <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider uppercase rounded bg-[#FECF59] text-black shadow-md">
                    4K
                  </span>
                </div>

                {/* Play hover (TV360 Gold Circle) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FECF59] to-amber-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(254,207,89,0.5)] transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-bold text-white group-hover:text-[#FECF59] transition-colors truncate">
                    {movie.name}
                  </p>
                  <p className="text-[10px] text-white/50 truncate">
                    {movie.origin_name || movie.year}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
