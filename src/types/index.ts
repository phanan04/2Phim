// VidSrc API response types
export interface VidSrcMovie {
  imdb_id: string;
  tmdb_id: string;
  title: string;
  year: string | number;
  quality: string;
}

export interface VidSrcTVShow {
  imdb_id: string;
  tmdb_id: string;
  title: string;
  year: string | number;
  quality: string;
}

export interface VidSrcEpisode {
  imdb_id: string;
  tmdb_id: string;
  title: string;
  season: number | string;
  episode: number | string;
}

export interface VidSrcListResponse<T> {
  result: T[];
  page_count: number;
  page: number;
}

// TMDB types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: TMDBGenre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  popularity: number;
  adult: boolean;
  imdb_id?: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: TMDBGenre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  popularity: number;
  imdb_id?: string;
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  overview: string;
  poster_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
}

export interface TMDBSeasonDetail {
  id: number;
  name: string;
  season_number: number;
  episodes: TMDBEpisode[];
  air_date: string;
  overview: string;
  poster_path: string | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBSearchResponse<T> {
  results: T[];
  total_results: number;
  total_pages: number;
  page: number;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCast[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

export type MediaType = "movie" | "tv";

export interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  media_type: MediaType;
  overview: string;
}
