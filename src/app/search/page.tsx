"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, Film, Tv } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TMDB_IMG } from "@/lib/constants";
import type { TMDBMovie, TMDBTVShow } from "@/types";

type Result = (TMDBMovie | TMDBTVShow) & { media_type: "movie" | "tv" };

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    Promise.resolve(query).then(async (q) => {
      if (cancelled) return;
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        if (!cancelled) {
          setResults(data.results ?? []);
          setTotal(data.total_results ?? 0);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-white/30 gap-4">
        <Search className="size-16 opacity-30" />
        <p className="text-lg">Nhập từ khóa để tìm kiếm phim</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex gap-3 bg-gray-50 dark:bg-white/5 rounded-2xl p-3">
            <Skeleton className="w-16 shrink-0 aspect-[2/3] rounded-xl bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-white/10" />
              <Skeleton className="h-3 w-3/4 bg-gray-200 dark:bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-white/30 gap-4">
        <Search className="size-16 opacity-30" />
        <p className="text-lg">Không tìm thấy kết quả cho &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-500 dark:text-white/50 text-sm">
        Tìm thấy{" "}
        <span className="text-gray-900 dark:text-white font-semibold">{total.toLocaleString()}</span>{" "}
        kết quả cho &ldquo;{query}&rdquo;
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {results.map((item) => {
          const isMovie = item.media_type === "movie";
          const movie = item as TMDBMovie;
          const show = item as TMDBTVShow;
          const title = isMovie ? movie.title : show.name;
          const date = isMovie ? movie.release_date : show.first_air_date;
          const year = date ? new Date(date).getFullYear() : "N/A";
          const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

          return (
            <Link key={`${item.media_type}-${item.id}`} href={href}>
              <div className="flex gap-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-2xl p-3 group">
                <div className="relative w-16 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 dark:bg-white/10">
                  <Image
                    src={TMDB_IMG.poster(item.poster_path, "w185")}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 py-1 space-y-1.5">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-sm line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-white/80 transition-colors">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isMovie ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}>
                      {isMovie ? (
                        <span className="flex items-center gap-0.5"><Film className="size-2.5" /> Phim</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Tv className="size-2.5" /> TV</span>
                      )}
                    </span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">{year}</span>
                  </div>
                  <span className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="size-3 fill-amber-400" />
                    {item.vote_average.toFixed(1)}
                  </span>
                  <p className="text-gray-400 dark:text-white/40 text-xs line-clamp-2">{item.overview}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen pt-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-16 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Search className="size-7 text-gray-500 dark:text-white/60" />
          Tìm Kiếm
        </h1>
        <Suspense fallback={<div className="text-gray-400 dark:text-white/40">Đang tải...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </main>
  );
}
