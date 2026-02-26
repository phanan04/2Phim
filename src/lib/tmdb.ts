import { TMDB_API_KEY, TMDB_BASE } from "@/lib/constants";
import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBSearchResponse,
  TMDBCredits,
  TMDBSeasonDetail,
  TMDBVideo,
} from "@/types";

export class TMDBConfigError extends Error {
  constructor() {
    super("TMDB_API_KEY chưa được cấu hình. Vui lòng thêm key vào file .env.local");
    this.name = "TMDBConfigError";
  }
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate = 3600
): Promise<T> {
  if (!TMDB_API_KEY) throw new TMDBConfigError();
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate } });
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
  return tmdbFetch<TMDBMovie>(`/movie/${id}`, {}, 86400);
}

export async function getMovieCredits(id: string | number) {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`, {}, 86400);
}

export async function getTVDetails(id: string | number) {
  return tmdbFetch<TMDBTVShow>(`/tv/${id}`, {}, 86400);
}

export async function getTVCredits(id: string | number) {
  return tmdbFetch<TMDBCredits>(`/tv/${id}/credits`, {}, 86400);
}

export async function getTVSeason(id: string | number, season: number) {
  // Season details rarely change — cache for 7 days
  return tmdbFetch<TMDBSeasonDetail>(`/tv/${id}/season/${season}`, {}, 604800);
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

export async function getMovieVideos(id: string | number) {
  return tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${id}/videos`);
}

export async function getTVVideos(id: string | number) {
  return tmdbFetch<{ results: TMDBVideo[] }>(`/tv/${id}/videos`);
}

export async function getSimilarMovies(id: string | number) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>(`/movie/${id}/recommendations`);
}

export async function getSimilarTV(id: string | number) {
  return tmdbFetch<TMDBSearchResponse<TMDBTVShow>>(`/tv/${id}/recommendations`);
}

export async function discoverMovies(params: {
  page?: number;
  genre?: number;
  sortBy?: string;
  year?: number;
}) {
  const query: Record<string, string> = {
    page: String(params.page || 1),
    sort_by: params.sortBy || "popularity.desc",
  };
  if (params.genre && params.genre > 0) {
    query.with_genres = String(params.genre);
  }
  if (params.year) {
    query.primary_release_year = String(params.year);
  }
  
  // Filter out obscure movies if sorting by newest or rating
  if (params.sortBy === "vote_average.desc" || params.sortBy === "primary_release_date.desc") {
    query["vote_count.gte"] = "100";
  }

  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>("/discover/movie", query);
}

export async function discoverTVShows(params: {
  page?: number;
  genre?: number;
  sortBy?: string;
  year?: number;
}) {
  const query: Record<string, string> = {
    page: String(params.page || 1),
    sort_by: params.sortBy || "popularity.desc",
  };
  if (params.genre && params.genre > 0) {
    query.with_genres = String(params.genre);
  }
  if (params.year) {
    query.first_air_date_year = String(params.year);
  }
  
  if (params.sortBy === "vote_average.desc" || params.sortBy === "first_air_date.desc") {
    query["vote_count.gte"] = "100";
  }

  return tmdbFetch<TMDBSearchResponse<TMDBTVShow>>("/discover/tv", query);
}

export async function getMovieGenres() {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
}

export async function getTVGenres() {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/tv/list");
}

export async function getNowPlayingMovies(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>("/movie/now_playing", {
    page: String(page),
  });
}

export async function getUpcomingMovies(page = 1) {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>("/movie/upcoming", {
    page: String(page),
  });
}
