import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchPage } from './pages/WatchPage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarkPage } from './pages/BookmarkPage';
import { HistoryPage } from './pages/HistoryPage';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* Chi tiết phim */}
            <Route path="/phim/:slug" element={<MovieDetailPage />} />

            {/* Xem phim */}
            <Route path="/xem/:slug" element={<WatchPage />} />
            <Route path="/xem/:slug/:episodeSlug" element={<WatchPage />} />

            {/* Danh sách phim theo loại */}
            <Route path="/danh-sach/:type" element={<CategoryPage sourceType="type" />} />

            {/* Danh sách theo thể loại */}
            <Route path="/the-loai/:slug" element={<CategoryPage sourceType="category" />} />

            {/* Danh sách theo quốc gia */}
            <Route path="/quoc-gia/:slug" element={<CategoryPage sourceType="country" />} />

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
