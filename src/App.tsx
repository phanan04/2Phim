import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarkPage } from './pages/BookmarkPage';
import { HistoryPage } from './pages/HistoryPage';
import { ExplorePage } from './pages/ExplorePage';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

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
          <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* Khám phá & Bộ lọc chuyên sâu */}
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
        </Layout>
        <AuthModal />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
