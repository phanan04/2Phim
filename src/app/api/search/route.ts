import { NextResponse } from "next/server";
import { searchMulti, TMDBConfigError } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);

  if (!query.trim()) {
    return NextResponse.json({ results: [], total_results: 0, total_pages: 0, page: 1 });
  }

  try {
    const data = await searchMulti(query, page);
    const filtered = data.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv"
    );
    return NextResponse.json({ ...data, results: filtered });
  } catch (e) {
    if (e instanceof TMDBConfigError) {
      return NextResponse.json({ error: "TMDB_API_KEY not configured", code: "NO_API_KEY" }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
