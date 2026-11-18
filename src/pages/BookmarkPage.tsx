import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Play, Heart } from 'lucide-react';
import { storage } from '../utils/storage';
import { BookmarkItem } from '../types/movie';
import { getImageUrl } from '../utils/image';

export const BookmarkPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    document.title = 'Xem Sau - 2 Phim';
    setBookmarks(storage.getBookmarks());
  }, []);

  const handleRemove = (slug: string) => {
    storage.removeBookmark(slug);
    setBookmarks(storage.getBookmarks());
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#18181C] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Heart className="w-7 h-7 text-red-500 fill-current" /> Danh Sách Xem Sau
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Đã lưu <strong className="text-white">{bookmarks.length}</strong> phim
          </p>
        </div>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {bookmarks.map((movie) => (
            <div
              key={movie.slug}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#18181C] border border-white/5 hover:border-[#FECF59]/60 transition-all hover:shadow-[0_0_20px_rgba(254,207,89,0.25)] hover:-translate-y-1"
            >
              <Link to={`/phim/${movie.slug}`} className="relative aspect-[2/3] w-full overflow-hidden bg-[#121214]">
                <img
                  src={getImageUrl(movie.poster_url || movie.thumb_url)}
                  alt={movie.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181C] via-transparent to-black/30 opacity-70" />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(movie.slug);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow-md"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </Link>

              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <Link
                    to={`/phim/${movie.slug}`}
                    className="text-sm font-bold text-white group-hover:text-[#FECF59] transition-colors line-clamp-1"
                  >
                    {movie.name}
                  </Link>
                  <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">{movie.origin_name}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                  <span>{movie.year || '2026'}</span>
                  {movie.episode_current && (
                    <span className="text-[#FECF59] font-bold">{movie.episode_current}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#18181C] rounded-3xl border border-white/5 text-white/50 space-y-4">
          <Heart className="w-12 h-12 text-white/20 mx-auto" />
          <div>
            <p className="text-lg font-bold text-white">Chưa có phim trong danh sách</p>
            <p className="text-xs text-white/40 mt-1">Bấm biểu tượng lưu ở bất kỳ phim nào để xem lại sau.</p>
          </div>
          <Link
            to="/"
            className="inline-block px-7 py-3 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black font-extrabold text-sm hover:shadow-lg transition-all"
          >
            Khám phá phim
          </Link>
        </div>
      )}
    </div>
  );
};
