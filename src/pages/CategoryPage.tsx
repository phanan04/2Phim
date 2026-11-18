import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { phimApi } from '../api/phimApi';
import { MovieItem, PaginationData } from '../types/movie';
import { MovieGrid } from '../components/common/MovieGrid';
import { Pagination } from '../components/common/Pagination';
import { SkeletonRow } from '../components/common/SkeletonCard';
import { Sparkles, Layers } from 'lucide-react';

interface CategoryPageProps {
  sourceType: 'type' | 'category' | 'country';
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ sourceType }) => {
  const { slug, type } = useParams<{ slug?: string; type?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [title, setTitle] = useState('');
  const [cdnImage, setCdnImage] = useState('https://phimimg.com');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    totalItemsPerPage: 20,
  });
  const [loading, setLoading] = useState(true);

  const activeKey = sourceType === 'type' ? type : slug;

  useEffect(() => {
    if (!activeKey) return;
    let isMounted = true;
    setLoading(true);

    async function loadCategoryMovies() {
      try {
        let res;
        if (sourceType === 'type') {
          res = await phimApi.getMoviesByType(activeKey!, page, 20);
        } else if (sourceType === 'category') {
          res = await phimApi.getMoviesByCategory(activeKey!, page, 20);
        } else {
          res = await phimApi.getMoviesByCountry(activeKey!, page, 20);
        }

        if (!isMounted) return;

        setMovies(res.items);
        setTitle(res.title);
        if (res.cdnImage) setCdnImage(res.cdnImage);
        if (res.pagination) {
          setPagination(res.pagination);
        }

        document.title = `${res.title} | 2 Phim`;
      } catch (err) {
        console.error('Category load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategoryMovies();

    return () => {
      isMounted = false;
    };
  }, [sourceType, activeKey, page]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#18181C] via-[#1E1E26] to-[#18181C] border border-white/5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FECF59] mb-1">
            <Sparkles className="w-4 h-4" /> Tuyển Chọn
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            {title || 'Danh Sách Phim'}
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Tổng cộng <strong className="text-white">{pagination.totalItems || movies.length}</strong> phim
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2 font-semibold">
            <Layers className="w-4 h-4 text-[#FECF59]" />
            <span>Trang {pagination.currentPage} / {pagination.totalPages}</span>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <SkeletonRow count={18} />
      ) : (
        <>
          <MovieGrid movies={movies} cdnImage={cdnImage} />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
