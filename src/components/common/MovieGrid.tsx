import React from 'react';
import { MovieItem } from '../../types/movie';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: MovieItem[];
  cdnImage?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({ movies, cdnImage }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-16 text-white/50">
        <p className="text-lg">Không có phim nào trong danh mục này.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie._id || movie.slug} movie={movie} cdnImage={cdnImage} />
      ))}
    </div>
  );
};
