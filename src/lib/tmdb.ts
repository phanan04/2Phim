import { TMDB_API_KEY, TMDB_BASE } from "@/lib/constants";
import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBSearchResponse,
  TMDBCredits,
  TMDBSeasonDetail,
} from "@/types";

export class TMDBConfigError extends Error {
  constructor() {
    super("TMDB_API_KEY chưa được cấu hình. Vui lòng thêm key vào file .env.local");
    this.name = "TMDBConfigError";
  }
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!TMDB_API_KEY) throw new TMDBConfigError();
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    if (res.status === 401) throw new TMDBConfigError();
    throw new Error(`TMDB error ${res.status}: ${path}`);
  }
  return res.json();
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie & TMDBTVShow & { media_type: string }>>(
    "/search/multi",
    { query, page: String(page), include_adult: "false" }
  );
}

export async function getMovieDetails(id: string | number) {
  return tmdbFetch<TMDBMovie>(`/movie/${id}`);
}

export async function getMovieCredits(id: string | number) {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`);
}

export async function getTVDetails(id: string | number) {
  return tmdbFetch<TMDBTVShow>(`/tv/${id}`);
}

export async function getTVCredits(id: string | number) {
  return tmdbFetch<TMDBCredits>(`/tv/${id}/credits`);
}

export async function getTVSeason(id: string | number, season: number) {
  return tmdbFetch<TMDBSeasonDetail>(`/tv/${id}/season/${season}`);
}

export async function getTrendingMovies(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>("/trending/movie/week", {
    page: String(page),
  });
}

export async function getTrendingTV(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBTVShow>>("/trending/tv/week", {
    page: String(page),
  });
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>("/movie/popular", {
    page: String(page),
  });
}

export async function getTopRatedMovies(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>("/movie/top_rated", {
    page: String(page),
  });
}

export async function getPopularTV(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBTVShow>>("/tv/popular", {
    page: String(page),
  });
}

export async function getMoviesByTmdbIds(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => getMovieDetails(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<TMDBMovie> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function getTVShowsByTmdbIds(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => getTVDetails(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<TMDBTVShow> => r.status === "fulfilled")
    .map((r) => r.value);
}
