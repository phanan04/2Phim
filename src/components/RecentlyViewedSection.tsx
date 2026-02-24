"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Section } from "@/components/HomeSection";
import type { TMDBMovie, TMDBTVShow } from "@/types";

export function RecentlyViewedSection() {
  const { items, clearHistory } = useRecentlyViewed();

  if (items.length === 0) return null;

  const movies = items
    .filter((i) => i.type === "movie")
    .map(
      (i) =>
        ({
          id: i.id,
          title: i.title,
          poster_path: i.poster_path,
          backdrop_path: null,
          release_date: i.date,
          vote_average: i.vote_average,
          vote_count: 0,
          overview: "",
          genre_ids: [],
          original_title: i.title,
          popularity: 0,
          adult: false,
        } as TMDBMovie)
    );

  const shows = items
    .filter((i) => i.type === "tv")
    .map(
      (i) =>
        ({
          id: i.id,
          name: i.title,
          poster_path: i.poster_path,
          backdrop_path: null,
          first_air_date: i.date,
          vote_average: i.vote_average,
          vote_count: 0,
          overview: "",
          genre_ids: [],
          original_name: i.title,
          popularity: 0,
        } as TMDBTVShow)
    );

  const allMovies = items
    .map((i) =>
      i.type === "movie"
        ? movies.find((m) => m.id === i.id)
        : undefined
    )
    .filter(Boolean) as TMDBMovie[];

  const allShows = items
    .map((i) =>
      i.type === "tv"
        ? shows.find((s) => s.id === i.id)
        : undefined
    )
    .filter(Boolean) as TMDBTVShow[];

  // Mix all items in order; we'll pass as movies for uniform display
  // Actually let's just show movies and shows separately
  const hasMovies = movies.length > 0;
  const hasShows = shows.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span />
        <button
          onClick={clearHistory}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Xóa lịch sử
        </button>
      </div>
      {hasMovies && (
        <Section
          title="🕐 Xem Gần Đây — Phim"
          movies={allMovies}
        />
      )}
      {hasShows && (
        <Section
          title="🕐 Xem Gần Đây — TV Show"
          shows={allShows}
        />
      )}
    </div>
  );
}
