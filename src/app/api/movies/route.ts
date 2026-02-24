import { NextResponse } from "next/server";
import { getLatestVidSrcMovies } from "@/lib/vidsrc";
import { getMoviesByTmdbIds, getPopularMovies, TMDBConfigError } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);

  try {
    // Try VidSrc list first (with domain fallback), else use TMDB popular
    try {
      const vidsrc = await getLatestVidSrcMovies(page);
      const ids = vidsrc.result.map((m) => m.tmdb_id).filter(Boolean);
      const movies = await getMoviesByTmdbIds(ids.slice(0, 20));
      return NextResponse.json({ movies, page: vidsrc.page, pageCount: vidsrc.page_count });
    } catch {
      // VidSrc unreachable — fall back to TMDB popular
      const data = await getPopularMovies(page);
      return NextResponse.json({
        movies: data.results,
        page: data.page,
        pageCount: Math.min(data.total_pages, 20),
      });
    }
  } catch (e) {
    if (e instanceof TMDBConfigError) {
      return NextResponse.json({ error: "TMDB_API_KEY not configured", code: "NO_API_KEY" }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

