import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { phimApi, CATEGORIES, COUNTRIES } from '../api/phimApi';
import { MovieItem, PaginationData } from '../types/movie';
import { MovieCard } from '../components/common/MovieCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  Tag,
  Globe,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';

export const YEARS = [
  { label: 'Tất cả năm', value: 'all' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' },
  { label: '2019', value: '2019' },
  { label: '2018', value: '2018' },
  { label: 'Trước 2018', value: 'truoc-2018' },
];

export const SORT_OPTIONS = [
  { label: 'Mới cập nhật', value: 'updated' },
  { label: 'Năm mới nhất', value: 'year' },
  { label: 'Đánh giá cao', value: 'rating' },
];

interface ExplorePageProps {
  sectionType?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ sectionType }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Effective type: from route prop or search param
  const activeType = sectionType || searchParams.get('type') || 'all';
  const activeCategory = searchParams.get('category') || 'all';
  const activeCountry = searchParams.get('country') || 'all';
  const activeYear = searchParams.get('year') || 'all';
  const activeSort = searchParams.get('sort') || 'updated';
  const activePage = parseInt(searchParams.get('page') || '1', 10);

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [cdnImage, setCdnImage] = useState('https://phimimg.com');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  });

  // Section meta information
  const sectionMeta = useMemo(() => {
    switch (activeType) {
      case 'phim-chieu-rap':
        return {
          title: 'Phim Chiếu Rạp',
          desc: 'Tổng hợp các tác phẩm điện ảnh bom tấn chiếu rạp đặc sắc với chất lượng hình ảnh và âm thanh đỉnh cao.',
        };
      case 'phim-bo':
        return {
          title: 'Phim Bộ',
          desc: 'Kho phim bộ phong phú từ Hàn Quốc, Trung Quốc, Âu Mỹ, Thái Lan... cập nhật tập mới nhanh nhất.',
        };
      case 'phim-le':
        return {
          title: 'Phim Lẻ',
          desc: 'Tuyển tập phim lẻ điện ảnh chọn lọc đa dạng thể loại, chất lượng Full HD & Vietsub / Thuyết minh.',
        };
      case 'hoat-hinh':
        return {
          title: 'Anime & Hoạt Hình',
          desc: 'Thế giới Anime Nhật Bản, hoạt hình 3D Trung Quốc và phim hoạt hình quốc tế đặc sắc nhất.',
        };
      case 'tv-shows':
        return {
          title: 'Truyền Hình & TV Shows',
          desc: 'Các chương trình truyền hình thực tế, gameshow giải trí và show truyền hình hấp dẫn.',
        };
      default:
        return {
          title: 'Khám Phá Phim',
          desc: 'Lọc và tìm kiếm toàn bộ kho phim bom tấn theo thể loại, quốc gia, năm phát hành và sắp xếp.',
        };
    }
  }, [activeType]);

  // Helper to update search params
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    if (!sectionType && activeType !== 'all') {
      next.set('type', activeType);
    }
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if any filter is active
  const hasActiveFilters =
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

        // Secondary client-side filters
        if (activeType !== 'all' && activeCategory !== 'all') {
          items = items.filter((m) => {
            if (activeType === 'phim-chieu-rap') return m.chieurap;
            if (activeType === 'phim-bo') return m.type === 'series';
            if (activeType === 'phim-le') return m.type === 'single';
            if (activeType === 'hoat-hinh') return m.type === 'hoathinh';
            return true;
          });
        }

        if (activeCountry !== 'all' && activeCategory !== 'all') {
          items = items.filter((m) =>
            m.country?.some((c) => c.slug === activeCountry)
          );
        }

        if (activeYear !== 'all') {
          if (activeYear === 'truoc-2018') {
            items = items.filter((m) => (m.year || 0) < 2018);
          } else {
            items = items.filter((m) => String(m.year) === activeYear);
          }
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

        document.title = `${sectionMeta.title} | 2 Phim`;
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
  }, [activeType, activeCategory, activeCountry, activeYear, activeSort, activePage, sectionMeta.title]);

  // Active filter label resolvers
  const activeCategoryName = CATEGORIES.find((c) => c.slug === activeCategory)?.name;
  const activeCountryName = COUNTRIES.find((c) => c.slug === activeCountry)?.name;
  const activeYearLabel = YEARS.find((y) => y.value === activeYear)?.label;
  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === activeSort)?.label;

  return (
    <div className="space-y-6 select-none max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 pb-20">
      {/* 1. SECTION HEADER (Thanh gọn, liền mạch) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{sectionMeta.title}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
              {pagination.totalItems || movies.length} phim
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-3xl">
            {sectionMeta.desc}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {/* 2. UNIFIED SYNCHRONIZED FILTER CONSOLE (Đồng bộ, giảm bớt bo cong, liền mạch với phần dưới) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-3 shadow-sm">
        {/* 4 Synchronized Filter Columns: Thể Loại, Quốc Gia, Năm Phát Hành, Sắp Xếp */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Cột 1: Thể Loại */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Thể Loại
            </label>
            <select
              value={activeCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#111116] hover:bg-[#16161c] border border-white/12 hover:border-white/25 focus:border-white/50 text-xs font-semibold text-white transition-colors cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-[#141419] text-white">
                Tất cả thể loại
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug} className="bg-[#141419] text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cột 2: Quốc Gia */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Quốc Gia
            </label>
            <select
              value={activeCountry}
              onChange={(e) => updateFilter('country', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#111116] hover:bg-[#16161c] border border-white/12 hover:border-white/25 focus:border-white/50 text-xs font-semibold text-white transition-colors cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-[#141419] text-white">
                Tất cả quốc gia
              </option>
              {COUNTRIES.map((ct) => (
                <option key={ct.slug} value={ct.slug} className="bg-[#141419] text-white">
                  {ct.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cột 3: Năm Phát Hành */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Năm Phát Hành
            </label>
            <select
              value={activeYear}
              onChange={(e) => updateFilter('year', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#111116] hover:bg-[#16161c] border border-white/12 hover:border-white/25 focus:border-white/50 text-xs font-semibold text-white transition-colors cursor-pointer focus:outline-none"
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value} className="bg-[#141419] text-white">
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cột 4: Sắp Xếp Theo */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Sắp Xếp Theo
            </label>
            <select
              value={activeSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#111116] hover:bg-[#16161c] border border-white/12 hover:border-white/25 focus:border-white/50 text-xs font-semibold text-white transition-colors cursor-pointer focus:outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#141419] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags (Hiện khi đang có bộ lọc được kích hoạt) */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-white/40 text-[11px] font-semibold">Đang lọc:</span>
            {activeCategory !== 'all' && activeCategoryName && (
              <button
                type="button"
                onClick={() => updateFilter('category', 'all')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                <span>{activeCategoryName}</span>
                <X className="w-3 h-3 text-white/50 hover:text-white" />
              </button>
            )}
            {activeCountry !== 'all' && activeCountryName && (
              <button
                type="button"
                onClick={() => updateFilter('country', 'all')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                <span>{activeCountryName}</span>
                <X className="w-3 h-3 text-white/50 hover:text-white" />
              </button>
            )}
            {activeYear !== 'all' && activeYearLabel && (
              <button
                type="button"
                onClick={() => updateFilter('year', 'all')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                <span>Năm {activeYearLabel}</span>
                <X className="w-3 h-3 text-white/50 hover:text-white" />
              </button>
            )}
            {activeSort !== 'updated' && activeSortLabel && (
              <button
                type="button"
                onClick={() => updateFilter('sort', 'updated')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                <span>{activeSortLabel}</span>
                <X className="w-3 h-3 text-white/50 hover:text-white" />
              </button>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-white/50 hover:text-white text-[11px] underline ml-auto transition-colors cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* 3. MOVIE RESULTS GRID (Liền mạch, đồng bộ với bộ lọc phía trên) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 18 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
          <p className="text-lg font-bold text-white">Không tìm thấy phim phù hợp</p>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Không có kết quả nào khớp với các tiêu chí lọc hiện tại. Vui lòng thử chọn lại thể loại hoặc quốc gia khác.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-white/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại tất cả bộ lọc</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} cdnImage={cdnImage} />
          ))}
        </div>
      )}

      {/* 4. PAGINATION CONTROLS */}
      {!loading && movies.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            type="button"
            onClick={() => handlePageChange(Math.max(1, activePage - 1))}
            disabled={activePage <= 1}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activePage <= 1
                ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/40'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold">
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (activePage <= 3) {
                pageNum = i + 1;
              } else if (activePage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = activePage - 2 + i;
              }

              const isCurrent = pageNum === activePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/15 text-white/80'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(Math.min(pagination.totalPages, activePage + 1))}
            disabled={activePage >= pagination.totalPages}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activePage >= pagination.totalPages
                ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/40'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
