import React from 'react';
import { ImdbInfo, TmdbInfo } from '../../types/movie';

interface RatingBadgeProps {
  imdb?: ImdbInfo;
  tmdb?: TmdbInfo;
  size?: 'sm' | 'md';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ imdb, tmdb, size = 'sm' }) => {
  const isSm = size === 'sm';
  const textClass = isSm ? 'text-[10px]' : 'text-xs';
  const pyClass = isSm ? 'py-0.5' : 'py-1';

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {imdb?.vote_average && imdb.vote_average > 0 ? (
        <div className={`flex items-center ${textClass} font-bold rounded overflow-hidden border border-[#F5C518]/60 shadow-sm`}>
          <span className={`bg-[#F5C518] text-black px-1.5 ${pyClass} font-extrabold tracking-tight`}>
            IMDb
          </span>
          <span className={`bg-black/80 text-white px-1.5 ${pyClass}`}>
            {Number(imdb.vote_average).toFixed(1)}
          </span>
        </div>
      ) : null}

      {tmdb?.vote_average && tmdb.vote_average > 0 ? (
        <div className={`flex items-center ${textClass} font-bold rounded overflow-hidden border border-[#01B4E4]/60 shadow-sm`}>
          <span className={`bg-[#01B4E4] text-white px-1.5 ${pyClass} font-extrabold tracking-tight`}>
            TMDb
          </span>
          <span className={`bg-black/80 text-white px-1.5 ${pyClass}`}>
            {Number(tmdb.vote_average).toFixed(1)}
          </span>
        </div>
      ) : null}
    </div>
  );
};
