import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { phimApi, CATEGORIES, COUNTRIES } from '../api/phimApi';
import { MovieItem, PaginationData } from '../types/movie';
import { MovieCard } from '../components/common/MovieCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import {
  Compass,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

export const TYPES = [
  { label: 'Tất cả loại', value: 'all' },
  { label: 'Chiếu Rạp', value: 'phim-chieu-rap' },
  { label: 'Phim Bộ', value: 'phim-bo' },
  { label: 'Phim Lẻ', value: 'phim-le' },
  { label: 'Hoạt Hình / Anime', value: 'hoat-hinh' },
  { label: 'TV Shows', value: 'tv-shows' },
];

export const YEARS = [
  { label: 'Tất cả năm', value: 'all' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' },
];

export const SORT_OPTIONS = [
  { label: 'Mới cập nhật', value: 'updated' },
  { label: 'Năm mới nhất', value: 'year' },
  { label: 'Đánh giá cao', value: 'rating' },
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active filter states from URL search params
  const activeType = searchParams.get('type') || 'all';
  const activeCategory = searchParams.get('category') || 'all';
  const activeCountry = searchParams.get('country') || 'all';
  const activeYear = searchParams.get('year') || 'all';
  const activeSort = searchParams.get('sort') || 'updated';
  const activePage = parseInt(searchParams.get('page') || '1', 10);

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [cdnImage, setCdnImage] = useState('https://phimimg.com');
  const [loading, setLoading] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  });

  // Helper to update search params
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if any filter is active
  const hasActiveFilters =
    activeType !== 'all' ||
    activeCategory !== 'all' ||
    activeCountry !== 'all' ||
    activeYear !== 'all' ||
    activeSort !== 'updated';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchMovies() {
      try {
        let res;
        // Smart routing to API based on primary selected filter
        if (activeCategory !== 'all') {
          res = await phimApi.getMoviesByCategory(activeCategory, activePage, 24);
        } else if (activeCountry !== 'all') {
          res = await phimApi.getMoviesByCountry(activeCountry, activePage, 24);
        } else if (activeType !== 'all') {
          res = await phimApi.getMoviesByType(activeType, activePage, 24);
        } else {
          // Default: Phim mới cập nhật
          const raw = await phimApi.getNewUpdates(activePage);
          res = {
            items: raw.items,
            cdnImage: 'https://phimimg.com',
            pagination: raw.pagination || {
              currentPage: activePage,
              totalPages: 50,
              totalItems: 1200,
              totalItemsPerPage: 24,
            },
          };
        }

        if (!isMounted) return;

        let items = res.items || [];

        // Secondary client-side filters (Type, Country, Year, Sort) if not primary
        if (activeType !== 'all' && activeCategory !== 'all') {
          items = items.filter((m) => {
            if (activeType === 'phim-chieu-rap') return m.chieurap;
            if (activeType === 'phim-bo') return m.type === 'series';
            if (activeType === 'phim-le') return m.type === 'single';
            if (activeType === 'hoat-hinh') return m.type === 'hoathinh';
            return true;
          });
        }

        if (activeYear !== 'all') {
          items = items.filter((m) => String(m.year) === activeYear);
        }

        if (activeSort === 'year') {
          items = [...items].sort((a, b) => (b.year || 0) - (a.year || 0));
        } else if (activeSort === 'rating') {
          items = [...items].sort(
            (a, b) =>
              (b.tmdb?.vote_average || b.imdb?.vote_average || 0) -
              (a.tmdb?.vote_average || a.imdb?.vote_average || 0)
          );
        }

        setMovies(items);
        if (res.cdnImage) setCdnImage(res.cdnImage);
        if (res.pagination) {
          setPagination(res.pagination);
        }

        document.title = 'Khám Phá Phim | 2Phim';
      } catch (err) {
        console.error('Explore fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [activeType, activeCategory, activeCountry, activeYear, activeSort, activePage]);

  return (
    <div className="space-y-8 select-none max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-7 rounded-3xl liquid-glass shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-white/60">
            <Compass className="w-4 h-4 text-white/80" />
            <span>Trung tâm điện ảnh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Khám Phá Phim
            <span className="text-xs font-bold px-3 py-1 rounded-full liquid-pill text-white/80">
              {pagination.totalItems || movies.length} phim
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Lọc và tìm kiếm toàn bộ kho phim bom tấn theo loại phim, thể loại, quốc gia và năm phát hành.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-full liquid-pill text-xs font-bold text-white/80 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}

          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isFilterPanelOpen ? 'liquid-cta-primary' : 'liquid-pill text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isFilterPanelOpen ? 'Ẩn bộ lọc' : 'Mở bộ lọc'}</span>
          </button>
        </div>
      </div>

      {/* Unified Filter Console */}
      {isFilterPanelOpen && (
        <div className="p-5 sm:p-7 rounded-3xl liquid-card space-y-6 shadow-xl animate-in fade-in duration-200">
          {/* Row 1: Loại Phim (Quick Pills) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider block">
              Loại Phim
            </span>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const isActive = activeType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => updateFilter('type', t.value)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'liquid-cta-primary shadow-md scale-105'
                        : 'liquid-pill text-white/75 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Thể Loại (Pill list) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider block">
              Thể Loại
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 no-scrollbar">
              <button
                onClick={() => updateFilter('category', 'all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'liquid-cta-primary shadow-sm'
                    : 'liquid-pill text-white/70 hover:text-white'
                }`}
              >
                Tất cả
              </button>
              {CATEGORIES.map((c) => {
                const isActive = activeCategory === c.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'liquid-cta-primary font-bold shadow-sm'
                        : 'liquid-pill text-white/70 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Quốc Gia + Năm + Sắp Xếp (Dropdowns / Selectors) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            {/* Quốc Gia */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">
                Quốc Gia
              </label>
              <select
                value={activeCountry}
                onChange={(e) => updateFilter('country', e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl liquid-pill text-xs font-bold text-white/90 bg-[#121216] focus:outline-none border border-white/15 cursor-pointer"
              >
                <option value="all" className="bg-[#121216] text-white">
                  Tất cả quốc gia
                </option>
                {COUNTRIES.map((cou) => (
                  <option key={cou.slug} value={cou.slug} className="bg-[#121216] text-white">
                    {cou.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Năm phát hành */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">
                Năm Phát Hành
              </label>
              <select
                value={activeYear}
                onChange={(e) => updateFilter('year', e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl liquid-pill text-xs font-bold text-white/90 bg-[#121216] focus:outline-none border border-white/15 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value} className="bg-[#121216] text-white">
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">
                Sắp Xếp Theo
              </label>
              <select
                value={activeSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl liquid-pill text-xs font-bold text-white/90 bg-[#121216] focus:outline-none border border-white/15 cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#121216] text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Movie Results Grid (Fluid & Responsive on all screens) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 18 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {movies.map((movie) => (
            <div key={movie._id || movie.slug} className="w-full">
              <MovieCard movie={movie} cdnImage={cdnImage} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl liquid-card space-y-3">
          <Compass className="w-12 h-12 text-white/30 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Không tìm thấy phim phù hợp</h3>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
            Không có kết quả cho tổ hợp bộ lọc bạn đã chọn. Hãy thử chọn "Tất cả" hoặc đặt lại bộ lọc.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-full liquid-cta-primary font-bold text-xs"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => handlePageChange(Math.max(1, activePage - 1))}
            disabled={activePage <= 1}
            className="px-4 py-2 rounded-full liquid-pill text-xs font-bold text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          <span className="px-4 py-2 rounded-full liquid-glass text-xs font-bold text-white">
            Trang {activePage} / {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(Math.min(pagination.totalPages, activePage + 1))}
            disabled={activePage >= pagination.totalPages}
            className="px-4 py-2 rounded-full liquid-pill text-xs font-bold text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
