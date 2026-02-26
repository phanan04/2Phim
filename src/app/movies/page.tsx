"use client";

import { useState, useEffect, useCallback } from "react";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { MovieGrid } from "@/components/MovieGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TMDBMovie } from "@/types";

const MOVIE_GENRES = [
  { id: 0, label: "Tất Cả" },
  { id: 28, label: "Hành Động" },
  { id: 16, label: "Hoạt Hình" },
  { id: 12, label: "Phiêu Lưu" },
  { id: 27, label: "Kinh Dị" },
  { id: 99, label: "Tài Liệu" },
  { id: 10749, label: "Tình Cảm" },
  { id: 35, label: "Hài" },
  { id: 878, label: "Viễn Tưởng" },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState(0);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [year, setYear] = useState(0);

  const fetchMovies = useCallback(async (p: number, g: number, s: string, y: number) => {
    setLoading(true);
    try {
      let url = `/api/movies?page=${p}&sortBy=${s}`;
      if (g > 0) url += `&genre=${g}`;
      if (y > 0) url += `&year=${y}`;
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.movies ?? []);
      setPageCount(data.pageCount ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(page, activeGenre, sortBy, year);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, activeGenre, sortBy, year, fetchMovies]);

  const handleGenreChange = (gId: number) => {
    if (gId === activeGenre) return;
    setActiveGenre(gId);
    setPage(1);
  };

  return (
    <main className="min-h-screen pt-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-16 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Film className="size-7 text-red-500" />
          Phim Mới Nhất
        </h1>

        {/* Filter Section - Inline professional look via Shadcn UI */}
        <div className="relative mb-6">
          <div 
            className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-3 hide-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex items-center gap-2 shrink-0">
              <Select value={String(activeGenre)} onValueChange={(val) => handleGenreChange(Number(val))}>
                <SelectTrigger className="w-[140px] rounded-full bg-transparent border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white transition-colors text-red-600 dark:text-red-400 font-medium">
                  <SelectValue placeholder="Thể loại" />
                </SelectTrigger>
                <SelectContent>
                  {MOVIE_GENRES.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setPage(1); }}>
                <SelectTrigger className="w-[180px] rounded-full bg-transparent border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white transition-colors">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity.desc">Phổ biến nhất</SelectItem>
                  <SelectItem value="primary_release_date.desc">Mới cập nhật</SelectItem>
                  <SelectItem value="vote_average.desc">Đánh giá cao</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(year)} onValueChange={(val) => { setYear(Number(val)); setPage(1); }}>
                <SelectTrigger className="w-[140px] rounded-full bg-transparent border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white transition-colors">
                  <SelectValue placeholder="Năm phát hành" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Mọi năm</SelectItem>
                  {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <MovieGrid movies={movies} loading={loading} />

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" /> Trước
            </button>
            <span className="text-gray-500 dark:text-white/50 text-sm">
              Trang <span className="text-gray-900 dark:text-white font-semibold">{page}</span> / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Sau <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
