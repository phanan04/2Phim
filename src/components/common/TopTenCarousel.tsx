import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';

interface TopTenCarouselProps {
  movies: MovieItem[];
  cdnImage?: string;
}

export const TopTenCarousel: React.FC<TopTenCarouselProps> = ({ movies, cdnImage }) => {
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

  const top10 = movies.slice(0, 10);
  if (!top10 || top10.length === 0) return null;

  return (
    <div className="relative my-10 select-none group/carousel">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.85)]" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Top 10 Thịnh Hành Hôm Nay
            <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 backdrop-blur-md">
              TOP 10
            </span>
          </h2>
        </div>

        {/* Liquid Glass Navigation Buttons */}
        <div className="flex items-center gap-2">
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

      {/* Embla Viewport with vertical padding so hover zoom scale(1.10) is not clipped */}
      <div
        className="overflow-hidden py-8 -my-8 px-1 cursor-grab active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex gap-4 sm:gap-6 items-end touch-pan-y">
          {top10.map((movie, index) => {
            const rank = index + 1;
            const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url, cdnImage);

            return (
              <div
                key={movie._id || movie.slug}
                className="relative flex items-end pl-8 sm:pl-10 w-[205px] sm:w-[225px] shrink-0 group cursor-pointer"
              >
                {/* Giant Frosted Crystal Rank Numeral Overlapping Left Edge */}
                <span
                  className={`text-[96px] sm:text-[112px] absolute left-0 -bottom-2 z-20 select-none pointer-events-none transition-transform duration-300 group-hover:scale-105 ${
                    rank <= 3 ? 'crystal-rank-num-top3' : 'crystal-rank-num'
                  }`}
                >
                  {rank}
                </span>

                {/* Pure Artwork Poster with Center Scale Pop-Out */}
                <Link
                  to={`/phim/${movie.slug}`}
                  className="artwork-poster-card w-full aspect-[2/3] block relative z-10"
                >
                  <img
                    src={posterUrl}
                    alt={movie.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500"
                  />

                  {/* Atmospheric Key-Art Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/35 opacity-75 group-hover:opacity-40 transition-opacity" />

                  {/* Minimal Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                    {rank <= 3 ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white text-[#070709] shadow-md tracking-wider">
                        👑 TOP {rank}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/60 backdrop-blur-md text-white/90 border border-white/20">
                        #{rank}
                      </span>
                    )}

                    {movie.quality && (
                      <span className="px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                        {movie.quality}
                      </span>
                    )}
                  </div>

                  {/* Play hover (Luminous White Pill Orb) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-11 h-11 rounded-full liquid-cta-primary flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
                    </div>
                  </div>

                  {/* Integrated Theatrical Key-Art Title */}
                  <div className="absolute bottom-2.5 inset-x-2 text-center pointer-events-none space-y-0.5 z-10">
                    <p className="text-xs font-black text-white group-hover:text-white transition-colors truncate drop-shadow-md">
                      {movie.name}
                    </p>
                    <p className="text-[10px] font-medium text-white/60 truncate">
                      {movie.origin_name || movie.year}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
