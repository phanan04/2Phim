import { NextResponse } from "next/server";
import { getLatestVidSrcTV } from "@/lib/vidsrc";
import { getTVShowsByTmdbIds, getPopularTV, TMDBConfigError } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);

  try {
    // Try VidSrc list first (with domain fallback), else use TMDB popular
    try {
      const vidsrc = await getLatestVidSrcTV(page);
      const ids = vidsrc.result.map((t) => t.tmdb_id).filter(Boolean);
      const shows = await getTVShowsByTmdbIds(ids.slice(0, 20));
      return NextResponse.json({ shows, page: vidsrc.page, pageCount: vidsrc.page_count });
    } catch {
      // VidSrc unreachable — fall back to TMDB popular TV
      const data = await getPopularTV(page);
      return NextResponse.json({
        shows: data.results,
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

