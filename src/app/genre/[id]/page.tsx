import { notFound, redirect } from "next/navigation";
import { Film, Tv, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MovieGrid } from "@/components/MovieGrid";
import {
  discoverMovies,
  discoverTVShows,
  getMovieGenres,
  getTVGenres,
  TMDBConfigError,
} from "@/lib/tmdb";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; page?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "movie" } = await searchParams;
  try {
    const genres = type === "tv" ? await getTVGenres() : await getMovieGenres();
    const genre = genres.genres.find((g) => String(g.id) === id);
    const label = type === "tv" ? "TV Show" : "Phim";
    return { title: genre ? `${genre.name} — ${label} | 2Phim` : `Thể loại | 2Phim` };
  } catch {
    return { title: "2Phim" };
  }
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "movie", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  let genreName = "Thể loại";
  let movies: Awaited<ReturnType<typeof discoverMovies>>["results"] = [];
  let shows: Awaited<ReturnType<typeof discoverTVShows>>["results"] = [];
  let totalPages = 1;

  try {
    if (type === "tv") {
      const [genreList, data] = await Promise.all([getTVGenres(), discoverTVShows({ genre: Number(id), page })]);
      shows = data.results;
      totalPages = Math.min(data.total_pages, 500);
      genreName = genreList.genres.find((g) => String(g.id) === id)?.name ?? "Thể loại";
    } else {
      const [genreList, data] = await Promise.all([getMovieGenres(), discoverMovies({ genre: Number(id), page })]);
      movies = data.results;
      totalPages = Math.min(data.total_pages, 500);
      genreName = genreList.genres.find((g) => String(g.id) === id)?.name ?? "Thể loại";
    }
  } catch (e) {
    if (e instanceof TMDBConfigError) redirect("/");
    notFound();
  }

  const items = type === "tv" ? shows : movies;
  if (items.length === 0) notFound();

  const buildHref = (p: number) => `/genre/${id}?type=${type}&page=${p}`;

  return (
    <main className="min-h-screen pt-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-16 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40">
          <Link href={type === "tv" ? "/tv" : "/movies"} className="hover:text-gray-900 dark:hover:text-white transition-colors">
            {type === "tv" ? "TV Show" : "Phim"}
          </Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-white/70">{genreName}</span>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {type === "tv" ? (
              <Tv className="size-7 text-blue-400" />
            ) : (
              <Film className="size-7 text-red-400" />
            )}
            <h1 className="text-2xl md:text-4xl font-bold">{genreName}</h1>
          </div>

          {/* Type toggle */}
          <div className="flex gap-2">
            <a
              href={`/genre/${id}?type=movie`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type !== "tv"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              Phim
            </a>
            <a
              href={`/genre/${id}?type=tv`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === "tv"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              TV Show
            </a>
          </div>
          <p className="text-sm text-gray-400 dark:text-white/40">Trang {page} / {totalPages}</p>
        </div>

        {/* Grid */}
        {type === "tv" ? <MovieGrid shows={shows} /> : <MovieGrid movies={movies} />}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {page > 1 && (
              <Link
                href={buildHref(page - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                <ChevronLeft className="size-4" /> Trước
              </Link>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <Link
                  key={p}
                  href={buildHref(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${p === page
                      ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {p}
                </Link>
              );
            })}

            {page < totalPages && (
              <Link
                href={buildHref(page + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Sau <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
