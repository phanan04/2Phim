import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

// Route-level Code Splitting for optimal initial load and minimal memory footprint
const MovieDetailPage = React.lazy(() => import('./pages/MovieDetailPage').then(m => ({ default: m.MovieDetailPage })));
const WatchPage = React.lazy(() => import('./pages/WatchPage').then(m => ({ default: m.WatchPage })));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const BookmarkPage = React.lazy(() => import('./pages/BookmarkPage').then(m => ({ default: m.BookmarkPage })));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));

function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#FECF59] animate-spin" />
    </div>
  );
}

function RedirectToExplore({ filterKey }: { filterKey: 'type' | 'category' | 'country' }) {
  const params = useParams();
  const val = params.slug || params.type;
  return <Navigate to={`/kham-pha?${filterKey}=${val}`} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Trang chủ */}
              <Route path="/" element={<HomePage />} />

              {/* Từng màn hình riêng biệt theo từng mục trên Header */}
              <Route path="/phim-chieu-rap" element={<ExplorePage sectionType="phim-chieu-rap" />} />
              <Route path="/chieu-rap" element={<ExplorePage sectionType="phim-chieu-rap" />} />
              <Route path="/phim-bo" element={<ExplorePage sectionType="phim-bo" />} />
              <Route path="/phim-le" element={<ExplorePage sectionType="phim-le" />} />
              <Route path="/anime" element={<ExplorePage sectionType="hoat-hinh" />} />
              <Route path="/hoat-hinh" element={<ExplorePage sectionType="hoat-hinh" />} />
              <Route path="/truyen-hinh" element={<ExplorePage sectionType="tv-shows" />} />
              <Route path="/tv-shows" element={<ExplorePage sectionType="tv-shows" />} />

              {/* Khám phá & Bộ lọc chuyên sâu chung */}
              <Route path="/kham-pha" element={<ExplorePage />} />

              {/* Chi tiết phim */}
              <Route path="/phim/:slug" element={<MovieDetailPage />} />

              {/* Xem phim */}
              <Route path="/xem/:slug" element={<WatchPage />} />
              <Route path="/xem/:slug/:episodeSlug" element={<WatchPage />} />

              {/* Gộp danh sách / thể loại / quốc gia chuyển về trang Khám Phá chung có phần lọc */}
              <Route path="/danh-sach/:type" element={<RedirectToExplore filterKey="type" />} />
              <Route path="/the-loai/:slug" element={<RedirectToExplore filterKey="category" />} />
              <Route path="/quoc-gia/:slug" element={<RedirectToExplore filterKey="country" />} />

              {/* Tìm kiếm */}
              <Route path="/tim-kiem" element={<SearchPage />} />

              {/* Yêu thích & Lịch sử */}
              <Route path="/yeu-thich" element={<BookmarkPage />} />
              <Route path="/lich-su" element={<HistoryPage />} />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
        <AuthModal />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
