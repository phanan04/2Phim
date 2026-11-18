import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Check,
} from 'lucide-react';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';
import { RatingBadge } from './RatingBadge';
import { storage } from '../../utils/storage';

interface HeroSliderProps {
  movies: MovieItem[];
  cdnImage?: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ movies, cdnImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const displayMovies = movies.slice(0, 7);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayMovies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayMovies.length) % displayMovies.length);
  };

  // Auto slide timer
  useEffect(() => {
    if (displayMovies.length <= 1 || isPaused) return;

    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, displayMovies.length]);

  if (!displayMovies.length) return null;

  const currentMovie = displayMovies[currentIndex];
  const backdropUrl = getImageUrl(currentMovie.thumb_url || currentMovie.poster_url, cdnImage);
  const isBookmarked = storage.isBookmarked(currentMovie.slug);

  // Generate realistic age rating (T13, T16, T18, P)
  const ageRating = (() => {
    const slug = currentMovie.slug || '';
    if (slug.includes('kinh-di') || slug.includes('sat-nhan')) return 'T18';
    if (slug.includes('hanh-dong') || slug.includes('chien-tranh')) return 'T16';
    if (slug.includes('hoat-hinh') || slug.includes('anime')) return 'P';
    return 'T13';
  })();

  return (
    <div
      className="relative w-full h-[520px] sm:h-[620px] md:h-[720px] lg:h-[800px] overflow-hidden select-none bg-[#0E0E10]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Billboard Backdrop Layer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Natural, vivid high-res image (zero darkening filter) */}
        <img
          key={currentMovie._id || currentMovie.slug}
          src={backdropUrl}
          alt={currentMovie.name}
          className="w-full h-full object-cover object-top transition-transform duration-1000 transform scale-105"
        />

        {/* Soft, Cinema Ambient Gradients */}
        <div className="absolute inset-0 hero-gradient-cinema pointer-events-none" />
        <div className="absolute inset-0 hero-gradient-side hidden md:block pointer-events-none" />
      </div>

      {/* Hero Content - Correct Layout & Consistent Grid Alignment */}
      <div className="relative z-10 h-full w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pb-16 sm:pb-20 md:pb-24 pointer-events-none">
        <div className="max-w-3xl space-y-4 animate-fadeIn pointer-events-auto">
          {/* Top Badges (TV360 Style) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" /> THỊNH HÀNH
            </span>

            {/* Age Rating Badge (TV360 Signature) */}
            <span className="px-2.5 py-0.5 text-[11px] font-black rounded-lg bg-red-600/90 text-white border border-red-500 shadow-sm">
              {ageRating}
            </span>

            {/* 4K Ultra HD Metallic Badge (TV360 Signature) */}
            <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-lg bg-gradient-to-r from-amber-400/25 to-yellow-500/20 text-[#FECF59] border border-[#FECF59]/40 shadow-sm">
              4K ULTRA HD
            </span>

            {currentMovie.episode_current && (
              <span className="px-3 py-0.5 text-xs font-bold rounded-full liquid-glass-button text-white">
                {currentMovie.episode_current}
              </span>
            )}

            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-black/50 backdrop-blur-md text-white/80 border border-white/10">
              {currentMovie.year || '2026'}
            </span>

            <RatingBadge imdb={currentMovie.imdb} tmdb={currentMovie.tmdb} size="md" />
          </div>

          {/* Titles */}
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl uppercase">
              {currentMovie.name}
            </h1>
            <p className="text-base sm:text-2xl text-[#FECF59] font-bold mt-2 drop-shadow">
              {currentMovie.origin_name}
            </p>
          </div>

          {/* Content summary */}
          {currentMovie.content && (
            <div
              className="text-xs sm:text-sm text-white/75 line-clamp-3 max-w-2xl leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: currentMovie.content.replace(/<[^>]+>/g, ''),
              }}
            />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 flex-wrap">
            {/* Primary Watch Button */}
            <Link
              to={`/xem/${currentMovie.slug}`}
              className="px-8 sm:px-10 py-3.5 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(254,207,89,0.4)] hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" /> XEM NGAY
            </Link>

            {/* Detail Button */}
            <Link
              to={`/phim/${currentMovie.slug}`}
              className="px-6 sm:px-8 py-3.5 rounded-full liquid-glass-button text-white hover:text-[#FECF59] font-bold text-sm sm:text-base flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Info className="w-4 h-4" /> CHI TIẾT
            </Link>

            {/* Bookmark button */}
            <button
              onClick={() => storage.toggleBookmark(currentMovie)}
              className={`p-3.5 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg ${
                isBookmarked
                  ? 'bg-[#FECF59] text-black shadow-[0_0_20px_rgba(254,207,89,0.4)]'
                  : 'liquid-glass-button text-white hover:text-[#FECF59]'
              }`}
              title={isBookmarked ? 'Đã lưu vào danh sách' : 'Lưu vào danh sách'}
            >
              {isBookmarked ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      <div className="absolute right-4 sm:right-8 bottom-6 sm:bottom-10 z-20 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full liquid-glass-button flex items-center justify-center text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"
          title="Phim trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full liquid-glass-button flex items-center justify-center text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"
          title="Phim sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators / Thumbnails Preview (TV360 Style) */}
      <div className="absolute right-28 sm:right-36 bottom-6 sm:bottom-10 z-20 hidden lg:flex items-center gap-2">
        {displayMovies.map((movie, idx) => {
          const isActive = idx === currentIndex;
          const thumb = getImageUrl(movie.thumb_url || movie.poster_url, cdnImage);
          return (
            <button
              key={movie._id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-11 w-20 rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                isActive
                  ? 'border-[#FECF59] scale-110 shadow-[0_0_15px_rgba(254,207,89,0.5)]'
                  : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img src={thumb} alt={movie.name} className="w-full h-full object-cover" />
              {isActive && (
                <div className="absolute inset-0 bg-[#FECF59]/20 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-[#FECF59] fill-[#FECF59]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile/Tablet Bar Indicators */}
      <div className="absolute left-4 sm:left-8 bottom-6 z-20 flex lg:hidden items-center gap-1.5">
        {displayMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-[#FECF59]' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
