"use client";

import { useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import type { TMDBMovie, TMDBTVShow } from "@/types";

const GENRES = [
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

interface Props {
    movies?: TMDBMovie[];
    shows?: TMDBTVShow[];
}

export function GenreFilterSection({ movies = [], shows = [] }: Props) {
    const [activeGenre, setActiveGenre] = useState(0);

    const filtered = activeGenre === 0
        ? movies
        : movies.filter((m) => m.genre_ids?.includes(activeGenre));

    if (movies.length === 0) return null;

    return (
        <section className="space-y-6">
            {/* Genre pill filters */}
            <div className="flex items-center gap-2 flex-wrap">
                {GENRES.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setActiveGenre(g.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeGenre === g.id
                                ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10"
                                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            {/* Section title */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {activeGenre === 0 ? "🎭 Phim Phổ Biến" : `🎭 ${GENRES.find(g => g.id === activeGenre)?.label}`}
                </h2>
            </div>

            {/* Movie grid row (scrollable) */}
            <div
                className="flex gap-3 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none" }}
            >
                {filtered.slice(0, 20).map((movie) => (
                    <div key={movie.id} className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
                        <MovieCard type="movie" data={movie} />
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-gray-400 dark:text-white/40 text-sm py-8">Không có phim nào trong thể loại này.</p>
                )}
            </div>
        </section>
    );
}
