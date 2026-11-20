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
  { label: '2017', value: '2017' },
  { label: '2016', value: '2016' },
  { label: '2015', value: '2015' },
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
  const [jumpPageInput, setJumpPageInput] = useState(activePage.toString());

  useEffect(() => {
    setJumpPageInput(activePage.toString());
  }, [activePage]);

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
        // Gọi API với đầy đủ các bộ lọc phía máy chủ (Server-Side Filtering)
        // Đảm bảo mỗi trang luôn tải đủ số phim đồng đều, không bị lọc thiếu ở client
        const res = await phimApi.getExploreMovies({
          type: activeType,
          category: activeCategory,
          country: activeCountry,
          year: activeYear,
          sort: activeSort,
          page: activePage,
          limit: 24,
        });

        if (!isMounted) return;

        let items = res.items || [];

        // Nếu người dùng chọn sắp xếp đánh giá cao
        if (activeSort === 'rating') {
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-8 select-none">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
            {/* Về trang đầu (1) nếu trang hiện tại > 3 */}
            {activePage > 3 && (
              <>
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-xs font-bold"
                  title="Trang đầu (1)"
                >
                  1
                </button>
                {activePage > 4 && <span className="text-white/40 px-0.5 text-xs">...</span>}
              </>
            )}

            {/* Nút Trang trước */}
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
              <span className="hidden sm:inline">Trước</span>
            </button>

            {/* Các nút số trang */}
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

                if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                const isCurrent = pageNum === activePage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#FECF59] text-black font-extrabold shadow-md'
                        : 'bg-white/5 hover:bg-white/15 text-white/80'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Nút Trang sau */}
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
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Đến trang cuối nếu còn xa trang cuối */}
            {activePage < pagination.totalPages - 2 && (
              <>
                {activePage < pagination.totalPages - 3 && <span className="text-white/40 px-0.5 text-xs">...</span>}
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-xs font-bold"
                  title={`Trang cuối (${pagination.totalPages})`}
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
          </div>

          {/* Ô nhập trực tiếp trang muốn tới */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = parseInt(jumpPageInput, 10);
              if (!isNaN(target) && target >= 1 && target <= pagination.totalPages) {
                handlePageChange(target);
              }
            }}
            className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl text-xs shrink-0"
          >
            <span className="text-white/60 text-xs">Đến trang:</span>
            <input
              type="number"
              min={1}
              max={pagination.totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={activePage.toString()}
              className="w-14 h-8 text-center rounded-lg bg-black/50 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-[#FECF59] transition-all"
            />
            <span className="text-white/40 text-xs">/ {pagination.totalPages}</span>
            <button
              type="submit"
              className="px-3 h-8 rounded-lg bg-[#FECF59] hover:bg-[#FECF59]/90 text-black font-bold text-xs transition-colors cursor-pointer active:scale-95"
            >
              Đi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
