"use client";

import { useState, useEffect, useCallback } from "react";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Film className="size-8 text-red-500" /> Phim Mới Nhất
        </h1>

        <MovieGrid movies={movies} loading={loading} />

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-white/20 text-gray-300 hover:text-white gap-1"
            >
              <ChevronLeft className="size-4" /> Trước
            </Button>
            <span className="text-gray-400 text-sm">
              Trang{" "}
              <span className="text-white font-semibold">{page}</span> /{" "}
              {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="border-white/20 text-gray-300 hover:text-white gap-1"
            >
              Sau <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
