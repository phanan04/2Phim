import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Play, Flame, Compass } from 'lucide-react';
import { phimApi } from '../../api/phimApi';
import { MovieItem } from '../../types/movie';
import { getImageUrl } from '../../utils/image';

interface LiveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({ isOpen, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cdnImage, setCdnImage] = useState('https://phimimg.com');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const trendingTags = [
    'Godzilla Trừ Một',
    'Phim Chiếu Rạp 2026',
    'Cổ Trang Trung Quốc',
    'K-Drama Hàn Quốc',
    'Anime Hot',
    'Hành Động Mỹ',
    'Phim Ma Kinh Dị',
    'Hoạt Hình',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setKeyword('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await phimApi.searchMovies(keyword, 1, 8);
        setResults(res.items);
        if (res.cdnImage) setCdnImage(res.cdnImage);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && keyword.trim()) {
      onClose();
      navigate(`/tim-kiem?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleSelectMovie = (slug: string) => {
    onClose();
    navigate(`/phim/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl liquid-glass shadow-[0_32px_90px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-white/10 bg-white/5">
          <Search className="w-5 h-5 text-white/80 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm phim, diễn viên, đạo diễn, anime..."
            className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-base sm:text-lg font-medium"
          />
          {loading && <Loader2 className="w-5 h-5 text-white/80 animate-spin mr-2 shrink-0" />}
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="p-1 text-white/50 hover:text-white mr-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[11px] px-2.5 py-1 rounded-full liquid-pill text-white/70 hover:text-white transition-colors ml-1 font-mono cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 no-scrollbar">
          {results.length > 0 ? (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider px-2 block mb-2">
                Kết quả tìm kiếm ({results.length} phim):
              </span>
              {results.map((movie) => (
                <div
                  key={movie._id || movie.slug}
                  onClick={() => handleSelectMovie(movie.slug)}
                  className="group flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/15"
                >
                  <div className="relative w-12 h-16 sm:w-14 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#101015] border border-white/10">
                    <img
                      src={getImageUrl(movie.poster_url || movie.thumb_url, cdnImage)}
                      alt={movie.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-7 h-7 rounded-full liquid-cta-primary flex items-center justify-center shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors truncate">
                        {movie.name}
                      </h4>
                      {movie.episode_current && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 shrink-0">
                          {movie.episode_current}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 truncate mt-0.5 font-medium">{movie.origin_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-white/60">
                      <span>{movie.year || '2026'}</span>
                      {movie.quality && <span className="text-white/80 font-semibold">• {movie.quality}</span>}
                      {movie.lang && <span>• {movie.lang}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : keyword.trim() && !loading ? (
            <div className="text-center py-12 text-white/50 text-sm space-y-2">
              <Compass className="w-10 h-10 text-white/20 mx-auto" />
              <p>Không tìm thấy phim phù hợp với "{keyword}"</p>
              <p className="text-xs text-white/30">Hãy thử tìm theo tên tiếng Anh, diễn viên hoặc thể loại.</p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/70 mb-2.5">
                  <Flame className="w-4 h-4 text-white/80" />
                  <span>Tìm kiếm phổ biến hôm nay:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setKeyword(tag)}
                      className="px-3.5 py-1.5 rounded-full liquid-pill text-xs font-semibold text-white/80 hover:text-black hover:bg-white transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View All Footer */}
        {results.length > 0 && (
          <div className="p-3 bg-white/5 border-t border-white/10 text-center">
            <button
              onClick={() => {
                onClose();
                navigate(`/tim-kiem?q=${encodeURIComponent(keyword.trim())}`);
              }}
              className="text-xs sm:text-sm font-bold text-white hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <span>Xem tất cả kết quả cho "{keyword}"</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
