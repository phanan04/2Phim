import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Star, Sparkles, Crown } from 'lucide-react';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';
import { storage } from '../../utils/storage';

interface LandscapeCardProps {
  movie: MovieItem;
  cdnImage?: string;
}

export const LandscapeCard: React.FC<LandscapeCardProps> = ({ movie, cdnImage }) => {
  const [isBookmarked, setIsBookmarked] = useState(() => storage.isBookmarked(movie.slug));
  const [imgError, setImgError] = useState(false);

  const imageSrc = imgError
    ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60'
    : getImageUrl(movie.thumb_url || movie.poster_url, cdnImage);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = storage.toggleBookmark({
      slug: movie.slug,
      name: movie.name,
      origin_name: movie.origin_name,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      year: movie.year,
      episode_current: movie.episode_current,
      quality: movie.quality,
    });
    setIsBookmarked(updated);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#16161C] border-2 border-transparent hover:border-[#FECF59] transition-all duration-300 ease-out hover:shadow-[0_16px_36px_rgba(0,0,0,0.8),0_0_20px_rgba(254,207,89,0.3)] hover:scale-105 hover:-translate-y-1.5">
      {/* 16:9 Thumbnail Image */}
      <Link to={`/phim/${movie.slug}`} className="relative aspect-video w-full overflow-hidden bg-[#121214]">
        <img
          src={imageSrc}
          alt={movie.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#16161C] via-transparent to-black/25 opacity-80 group-hover:opacity-40 transition-opacity" />

        {/* Badges (TV360 Style) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            {movie.chieurap ? (
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-[#E50914] text-white shadow-md flex items-center gap-1 tracking-wider">
                👑 VIP
              </span>
            ) : movie.episode_current ? (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-[#FECF59] text-black shadow-md">
                {movie.episode_current}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-white/20 backdrop-blur-md text-white">
                HD
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <span className="px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded bg-[#FECF59] text-black shadow-md">
              4K ULTRA
            </span>

            <button
              onClick={handleBookmark}
              aria-label="Lưu phim"
              className={`p-1.5 rounded-full transition-all duration-200 ${
                isBookmarked
                  ? 'bg-amber-500 text-black font-black'
                  : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
              }`}
            >
              <Heart className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center Play Button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(254,207,89,0.5)] transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Language / Time info bottom of image */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
          {movie.lang && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/80 text-white/90 border border-white/10">
              {movie.lang}
            </span>
          )}
          {movie.time && (
            <span className="text-[9px] text-white/80 bg-black/80 px-2 py-0.5 rounded-full">
              {movie.time}
            </span>
          )}
        </div>
      </Link>

      {/* Info details */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <Link
            to={`/phim/${movie.slug}`}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FECF59] transition-colors line-clamp-1 leading-snug"
            title={movie.name}
          >
            {movie.name}
          </Link>
          <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5" title={movie.origin_name}>
            {movie.origin_name || movie.name}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
          <span className="text-[#FECF59] font-bold">{movie.year || '2026'}</span>
          {(movie.tmdb?.vote_average || movie.imdb?.vote_average) && (
            <div className="flex items-center gap-1 text-[#FECF59] font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>
                {(movie.tmdb?.vote_average || movie.imdb?.vote_average)?.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
