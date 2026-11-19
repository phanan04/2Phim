import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Star } from 'lucide-react';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';
import { storage } from '../../utils/storage';

interface MovieCardProps {
  movie: MovieItem;
  cdnImage?: string;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, cdnImage }) => {
  const [isBookmarked, setIsBookmarked] = useState(() => storage.isBookmarked(movie.slug));
  const [imgError, setImgError] = useState(false);

  const posterSrc = imgError
    ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60'
    : getImageUrl(movie.poster_url || movie.thumb_url, cdnImage);

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

  const rating = movie.tmdb?.vote_average || movie.imdb?.vote_average;

  return (
    <div className="group relative flex flex-col select-none">
      {/* VieON / Apple VisionOS Pure Artwork Poster Card with Center Scale Pop-Out */}
      <Link
        to={`/phim/${movie.slug}`}
        className="artwork-poster-card aspect-[2/3] w-full block cursor-pointer"
      >
        <img
          src={posterSrc}
          alt={movie.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500"
        />

        {/* Ambient Top & Bottom Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/35 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges (Subtle Frosted Micro-Pills) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1">
            {movie.chieurap ? (
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-white text-[#070709] shadow-sm tracking-wider">
                VIP
              </span>
            ) : movie.episode_current ? (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                {movie.episode_current}
              </span>
            ) : movie.quality ? (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-white/15 backdrop-blur-md text-white/90 border border-white/20">
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

        {/* Center Play Orb on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <div className="w-11 h-11 rounded-full liquid-cta-primary flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
          </div>
        </div>

        {/* Bottom Format Badge (4K HDR / Sub) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-semibold text-white/80 z-10">
          {movie.lang && (
            <span className="px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-md border border-white/10 text-white/90">
              {movie.lang}
            </span>
          )}
          {rating ? (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-md border border-white/10 text-white font-bold ml-auto">
              <Star className="w-2.5 h-2.5 fill-current text-white" />
              <span>{rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-md border border-white/10 text-white/70 ml-auto">
              {movie.year || '2026'}
            </span>
          )}
        </div>
      </Link>

      {/* Movie Info (Below Card) */}
      <div className="pt-2.5 px-0.5 space-y-0.5">
        <Link
          to={`/phim/${movie.slug}`}
          className="text-xs sm:text-sm font-bold text-white group-hover:text-white/90 transition-colors line-clamp-1 leading-snug tracking-tight block"
          title={movie.name}
        >
          {movie.name}
        </Link>
        <p className="text-[11px] text-white/50 line-clamp-1 tracking-normal">
          {movie.origin_name || movie.name}
        </p>
      </div>
    </div>
  );
};
