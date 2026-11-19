import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Star } from 'lucide-react';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';
import { storage } from '../../utils/storage';

interface LandscapeCardProps {
  movie: MovieItem;
  cdnImage?: string;
  progressPercent?: number;
}

export const LandscapeCard: React.FC<LandscapeCardProps> = ({
  movie,
  cdnImage,
  progressPercent = 65,
}) => {
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
    <div className="group relative flex flex-col select-none">
      {/* 16:9 Spatial Media Card */}
      <Link
        to={`/phim/${movie.slug}`}
        className="liquid-card rounded-2xl aspect-video w-full block cursor-pointer"
      >
        <img
          src={imageSrc}
          alt={movie.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/35 opacity-75 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1">
            {movie.chieurap ? (
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-white text-[#070709] shadow-sm">
                VIP
              </span>
            ) : movie.episode_current ? (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                {movie.episode_current}
              </span>
            ) : movie.quality ? (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                {movie.quality}
              </span>
            ) : null}
          </div>

          <button
            onClick={handleBookmark}
            aria-label="Lưu phim"
            className={`pointer-events-auto w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              isBookmarked
                ? 'bg-white text-black'
                : 'bg-black/55 backdrop-blur-md text-white/75 hover:text-white hover:bg-black/80 border border-white/20'
            }`}
          >
            <Heart className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center Play Button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <div className="w-11 h-11 rounded-full liquid-cta-primary flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
          </div>
        </div>

        {/* Progress Bar (Bottom of 16:9 Thumbnail) */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 overflow-hidden z-10">
          <div
            className="h-full liquid-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Link>

      {/* Info Details */}
      <div className="pt-2.5 px-0.5 space-y-0.5">
        <Link
          to={`/phim/${movie.slug}`}
          className="text-xs sm:text-sm font-bold text-white group-hover:text-white/90 transition-colors line-clamp-1 leading-snug tracking-tight block"
          title={movie.name}
        >
          {movie.name}
        </Link>
        <div className="flex items-center justify-between text-[11px] text-white/50">
          <span className="truncate max-w-[140px]">{movie.origin_name || movie.name}</span>
          <span className="font-semibold text-white/70">{movie.year || '2026'}</span>
        </div>
      </div>
    </div>
  );
};
