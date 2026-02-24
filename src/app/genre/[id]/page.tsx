import { notFound, redirect } from "next/navigation";
import { Film, Tv } from "lucide-react";
import { MovieGrid } from "@/components/MovieGrid";
import {
  discoverMoviesByGenre,
  discoverTVByGenre,
  getMovieGenres,
  getTVGenres,
  TMDBConfigError,
} from "@/lib/tmdb";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "movie" } = await searchParams;
  try {
    const genres =
      type === "tv"
        ? await getTVGenres()
        : await getMovieGenres();
    const genre = genres.genres.find((g) => String(g.id) === id);
    const label = type === "tv" ? "TV Show" : "Phim";
    return {
      title: genre
        ? `${genre.name} — ${label} | 2Phim`
        : `Thể loại | 2Phim`,
    };
  } catch {
    return { title: "2Phim" };
  }
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type = "movie" } = await searchParams;

  let genreName = "Thể loại";
  let movies: Awaited<ReturnType<typeof discoverMoviesByGenre>>["results"] = [];
  let shows: Awaited<ReturnType<typeof discoverTVByGenre>>["results"] = [];

  try {
    if (type === "tv") {
      const [genreList, data] = await Promise.all([
        getTVGenres(),
        discoverTVByGenre(id),
      ]);
      shows = data.results;
      genreName = genreList.genres.find((g) => String(g.id) === id)?.name ?? "Thể loại";
    } else {
      const [genreList, data] = await Promise.all([
        getMovieGenres(),
        discoverMoviesByGenre(id),
      ]);
      movies = data.results;
      genreName = genreList.genres.find((g) => String(g.id) === id)?.name ?? "Thể loại";
    }
  } catch (e) {
    if (e instanceof TMDBConfigError) redirect("/");
    notFound();
  }

  const items = type === "tv" ? shows : movies;

  if (items.length === 0) notFound();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {type === "tv" ? (
              <Tv className="size-7 text-purple-400" />
            ) : (
              <Film className="size-7 text-red-400" />
            )}
            <h1 className="text-3xl md:text-4xl font-bold">{genreName}</h1>
          </div>
          {/* Toggle movie / tv */}
          <div className="flex gap-2 text-sm">
            <a
              href={`/genre/${id}?type=movie`}
              className={`px-4 py-1.5 rounded-full border transition-colors ${
                type !== "tv"
                  ? "bg-white text-gray-900 border-white font-semibold"
                  : "border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              Phim
            </a>
            <a
              href={`/genre/${id}?type=tv`}
              className={`px-4 py-1.5 rounded-full border transition-colors ${
                type === "tv"
                  ? "bg-white text-gray-900 border-white font-semibold"
                  : "border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              TV Show
            </a>
          </div>
        </div>

        {/* Grid */}
        {type === "tv" ? (
          <MovieGrid shows={shows} />
        ) : (
          <MovieGrid movies={movies} />
        )}
      </div>
    </main>
  );
}
