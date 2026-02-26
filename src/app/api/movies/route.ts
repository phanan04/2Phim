import { NextResponse } from "next/server";
import { discoverMovies, TMDBConfigError } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const genre = Number(searchParams.get("genre") ?? 0);
  const sortBy = searchParams.get("sortBy") || "popularity.desc";
  const year = Number(searchParams.get("year") ?? 0);

  try {
    const data = await discoverMovies({
      page,
      genre,
      sortBy,
      year: year > 0 ? year : undefined,
    });
    return NextResponse.json({
      movies: data.results,
      page: data.page,
      pageCount: Math.min(data.total_pages, 500),
    });
  } catch (e) {
    if (e instanceof TMDBConfigError) {
      return NextResponse.json({ error: "TMDB_API_KEY not configured", code: "NO_API_KEY" }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

