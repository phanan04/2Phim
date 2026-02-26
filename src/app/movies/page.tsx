"use client";

import { useState, useEffect, useCallback } from "react";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { MovieGrid } from "@/components/MovieGrid";
import type { TMDBMovie } from "@/types";

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?page=${p}`);
      const data = await res.json();
      setMovies(data.movies ?? []);
      setPageCount(data.pageCount ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchMovies]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white pt-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-16 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Film className="size-7 text-red-500" />
          Phim Mới Nhất
        </h1>

        <MovieGrid movies={movies} loading={loading} />

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" /> Trước
            </button>
            <span className="text-white/50 text-sm">
              Trang <span className="text-white font-semibold">{page}</span> / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Sau <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
