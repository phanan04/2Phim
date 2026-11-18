import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { phimApi } from '../api/phimApi';
import { MovieItem, PaginationData } from '../types/movie';
import { MovieGrid } from '../components/common/MovieGrid';
import { Pagination } from '../components/common/Pagination';
import { SkeletonRow } from '../components/common/SkeletonCard';
import { Search, Flame, Sparkles, X, Filter } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState(keyword);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [featuredSuggestions, setFeaturedSuggestions] = useState<MovieItem[]>([]);
  const [cdnImage, setCdnImage] = useState('https://phimimg.com');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    totalItemsPerPage: 20,
  });
  const [loading, setLoading] = useState(false);

  const trendingTags = [
    'Godzilla Trừ Một',
    'Phim Chiếu Rạp',
    'Cổ Trang',
    'K-Drama Hàn Quốc',
    'Anime',
    'Hành Động',
    'Kinh Dị',
  ];

  // If no keyword, load featured movies as recommendations
  useEffect(() => {
    if (!keyword) {
      phimApi.getNewUpdates(1).then((res) => {
        setFeaturedSuggestions(res.items.slice(0, 12));
      }).catch(console.error);
    }
  }, [keyword]);

  useEffect(() => {
    setInputVal(keyword);
    if (!keyword.trim()) {
      setMovies([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function doSearch() {
      try {
        const res = await phimApi.searchMovies(keyword, page, 20);
        if (!isMounted) return;

        setMovies(res.items);
        if (res.cdnImage) setCdnImage(res.cdnImage);
        if (res.pagination) setPagination(res.pagination);

        document.title = `Tìm kiếm: "${keyword}" - 2 Phim`;
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    doSearch();

    return () => {
      isMounted = false;
    };
  }, [keyword, page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim(), page: '1' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: keyword, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search Header Form (Liquid Glass) */}
      <div className="p-6 sm:p-10 rounded-3xl liquid-glass border border-white/10 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FECF59] mb-1">
            <Sparkles className="w-4 h-4" /> Khám Phá Kho Phim
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Tìm Kiếm Phim
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FECF59]" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập tên phim, diễn viên, đạo diễn, anime..."
              className="w-full pl-12 pr-10 py-3.5 rounded-full bg-black/40 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#FECF59] focus:shadow-[0_0_20px_rgba(254,207,89,0.25)] text-sm sm:text-base font-medium transition-all"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-8 sm:px-10 py-3.5 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-sm sm:text-base shadow-[0_0_20px_rgba(254,207,89,0.35)] transition-all shrink-0 cursor-pointer hover:scale-105"
          >
            Tìm Phim
          </button>
        </form>

        {/* Trending Tags */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/50">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Từ khóa thịnh hành:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setInputVal(tag);
                  setSearchParams({ q: tag, page: '1' });
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  keyword === tag
                    ? 'bg-[#FECF59] text-black shadow-md'
                    : 'liquid-glass-button text-white/80 hover:text-black hover:bg-[#FECF59]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {keyword && (
          <p className="text-xs sm:text-sm text-white/70 pt-1">
            Kết quả tìm kiếm cho: <strong className="text-[#FECF59] font-black text-sm sm:text-base">"{keyword}"</strong> ({pagination.totalItems || movies.length} phim)
          </p>
        )}
      </div>

      {/* Results Section */}
      {loading ? (
        <SkeletonRow count={12} />
      ) : movies.length > 0 ? (
        <div className="space-y-8">
          <MovieGrid movies={movies} cdnImage={cdnImage} />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : keyword ? (
        <div className="text-center py-20 rounded-3xl liquid-glass border border-white/10 text-white/50 space-y-3 shadow-xl">
          <Search className="w-12 h-12 text-white/20 mx-auto" />
          <p className="text-lg font-bold text-white">Không tìm thấy phim phù hợp</p>
          <p className="text-xs text-white/40 max-w-md mx-auto">
            Thử tìm kiếm với tên tiếng Anh, tên diễn viên hoặc dùng từ khóa ngắn gọn hơn.
          </p>
        </div>
      ) : (
        /* Gợi ý khi chưa tìm kiếm */
        featuredSuggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg sm:text-xl">
              <Sparkles className="w-5 h-5 text-[#FECF59]" />
              <span>Phim Thịnh Hành Đề Xuất Cho Bạn</span>
            </div>
            <MovieGrid movies={featuredSuggestions} />
          </div>
        )
      )}
    </div>
  );
};
