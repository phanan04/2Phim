import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
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

  // Take up to 5 featured movies for the filmstrip
  const displayMovies = movies.slice(0, 5);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayMovies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayMovies.length) % displayMovies.length);
  };

  // Auto slide timer (7.5 seconds)
  useEffect(() => {
    if (displayMovies.length <= 1 || isPaused) return;

    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, 7500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, displayMovies.length]);

  if (!displayMovies.length) return null;

  const currentMovie = displayMovies[currentIndex];
  const backdropUrl = getImageUrl(currentMovie.thumb_url || currentMovie.poster_url, cdnImage);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (currentMovie) {
      setBookmarked(storage.isBookmarked(currentMovie.slug));
    }
  }, [currentMovie?.slug]);

  const handleToggleBookmark = () => {
    if (!currentMovie) return;
    const added = storage.toggleBookmark(currentMovie);
    setBookmarked(added);
  };

  // Realistic rating tag
  const ageRating = (() => {
    const slug = currentMovie.slug || '';
    if (slug.includes('kinh-di') || slug.includes('sat-nhan')) return 'T18';
    if (slug.includes('hanh-dong') || slug.includes('chien-tranh')) return 'T16';
    if (slug.includes('hoat-hinh') || slug.includes('anime')) return 'P';
    return 'T13';
  })();

  const currentCounter = `${String(currentIndex + 1).padStart(2, '0')} / ${String(
    displayMovies.length
  ).padStart(2, '0')}`;

  return (
    <section
      aria-label="Phim tiêu biểu"
      className="relative w-full h-[84vh] min-h-[620px] max-h-[860px] overflow-hidden select-none bg-[#050507]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Edge-to-Edge High-Res Backdrop with Smooth 700ms Cross-Fade Stack */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {displayMovies.map((movie, idx) => {
          const isActive = idx === currentIndex;
          const bgUrl = getImageUrl(movie.thumb_url || movie.poster_url, cdnImage);
          return (
            <div
              key={movie._id || movie.slug}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              <img
                src={bgUrl}
                alt={movie.name}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover object-top filter brightness-[0.9] transform scale-[1.02]"
              />
            </div>
          );
        })}

        {/* Seamless Fade into Obsidian #050507 */}
        <div className="absolute inset-0 hero-gradient-cinema z-20 pointer-events-none" />
        <div className="absolute inset-0 hero-gradient-side hidden md:block z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/40 z-20 pointer-events-none" />
      </div>

      {/* 2. Hero Content Container */}
      <div className="absolute inset-0 z-30 px-4 sm:px-8 lg:px-12 pt-28 pb-10 flex flex-col justify-end pointer-events-none">
        <div className="max-w-[1520px] w-full mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8 pointer-events-auto">
          
          {/* Left Editorial Info & Pure White Actions */}
          <div className="max-w-2xl space-y-4">
            {/* Premiere / Format Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-white/90">
                {currentMovie.chieurap ? 'PHIM CHIẾU RẠP' : currentMovie.type === 'series' ? 'PHIM BỘ HOT' : 'PHIM NỔI BẬT'}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-5xl xl:text-[54px] font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-2xl line-clamp-2">
                {currentMovie.name}
              </h1>
              {currentMovie.origin_name && (
                <p className="text-sm sm:text-lg text-white/70 font-semibold mt-1 tracking-wide line-clamp-1">
                  {currentMovie.origin_name}
                </p>
              )}
            </div>

            {/* Technical Format Pills (Real Metadata Only) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <RatingBadge imdb={currentMovie.imdb} tmdb={currentMovie.tmdb} size="md" />
              {currentMovie.quality && (
                <span className="liquid-pill px-3 py-1 rounded-full text-white font-bold text-[11px]">
                  {currentMovie.quality}
                </span>
              )}
              {currentMovie.lang && (
                <span className="liquid-pill px-3 py-1 rounded-full text-white/90 text-[11px]">
                  {currentMovie.lang}
                </span>
              )}
              {currentMovie.year && (
                <span className="liquid-pill px-2.5 py-1 rounded-full text-white/80 text-[11px]">
                  {currentMovie.year}
                </span>
              )}
              {currentMovie.episode_current && (
                <span className="liquid-pill px-3 py-1 rounded-full text-white font-bold text-[11px]">
                  {currentMovie.episode_current}
                </span>
              )}
              <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-red-600/90 text-white border border-red-500 shadow-sm">
                {ageRating}
              </span>
            </div>

            {/* Synopsis */}
            {currentMovie.content && (
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-2 max-w-xl">
                {currentMovie.content.replace(/<[^>]+>/g, '')}
              </p>
            )}

            {/* Primary Action Buttons (Icon Only - Clean & Minimal) */}
            <div className="pt-2 flex items-center gap-3">
              {/* Primary Watch CTA */}
              <Link
                to={`/xem/${currentMovie.slug}`}
                className="liquid-cta-primary w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all"
                title="Xem ngay"
                aria-label="Xem ngay"
              >
                <Play className="w-5 h-5 fill-current ml-0.5 text-black" />
              </Link>

              {/* Details Pill */}
              <Link
                to={`/phim/${currentMovie.slug}`}
                className="liquid-pill w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all"
                title="Chi tiết phim"
                aria-label="Chi tiết phim"
              >
                <Info className="w-5 h-5" />
              </Link>

              {/* Bookmark Pill */}
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`liquid-pill w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                  bookmarked ? 'liquid-cta-primary text-black font-bold' : 'text-white'
                }`}
                title={bookmarked ? 'Đã lưu vào danh sách' : 'Thêm vào danh sách'}
                aria-label={bookmarked ? 'Đã lưu vào danh sách' : 'Thêm vào danh sách'}
              >
                {bookmarked ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom-Right 5-Item Horizontal Filmstrip Thumbnail Switcher */}
          <div className="space-y-2.5 lg:max-w-[500px] w-full">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">
                Đang chiếu nổi bật
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/80 tabular-nums">
                  {currentCounter}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevSlide}
                    aria-label="Phim trước"
                    className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Phim sau"
                    className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filmstrip Row */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {displayMovies.map((movie, idx) => {
                const isActive = idx === currentIndex;
                const thumb = getImageUrl(movie.thumb_url || movie.poster_url, cdnImage);
                return (
                  <button
                    key={movie._id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex-1 min-w-[76px] sm:min-w-[88px] h-14 sm:h-16 rounded-xl overflow-hidden transition-all duration-300 border ${
                      isActive
                        ? 'border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.35)] opacity-100 z-10'
                        : 'border-white/15 opacity-45 hover:opacity-90 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={movie.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-white/15 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
