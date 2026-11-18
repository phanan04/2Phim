export interface TmdbInfo {
  id?: string | number | null;
  type?: string | null;
  season?: number | null;
  vote_average?: number;
  vote_count?: number;
}

export interface ImdbInfo {
  id?: string | null;
  vote_average?: number;
  vote_count?: number;
}

export interface MovieCategory {
  id: string;
  name: string;
  slug: string;
}

export interface MovieCountry {
  id: string;
  name: string;
  slug: string;
}

export interface EpisodeData {
  name: string;
  slug: string;
  filename?: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  is_ai?: boolean;
  server_data: EpisodeData[];
}

export interface MovieItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type?: string;
  thumb_url: string;
  poster_url: string;
  sub_docquyen?: boolean;
  chieurap?: boolean;
  time?: string;
  episode_current?: string;
  episode_total?: number | string;
  quality?: string;
  lang?: string;
  year: number;
  content?: string;
  tmdb?: TmdbInfo;
  imdb?: ImdbInfo;
  category?: MovieCategory[];
  country?: MovieCountry[];
  view?: number;
  actor?: string[];
  director?: string[];
  trailer_url?: string | null;
}

export interface MovieDetail extends MovieItem {
  status?: string;
  episodes: EpisodeServer[];
  showtimes?: string;
}

export interface PaginationData {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface MovieListResponse {
  status: boolean;
  msg?: string;
  items?: MovieItem[];
  pagination?: PaginationData;
  data?: {
    titlePage?: string;
    items?: MovieItem[];
    params?: {
      pagination?: PaginationData;
    };
    APP_DOMAIN_CDN_IMAGE?: string;
  };
}

export interface HistoryItem {
  slug: string;
  name: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  episodeName: string;
  episodeSlug: string;
  serverName: string;
  currentTime?: number;
  duration?: number;
  updatedAt: number;
}

export interface BookmarkItem {
  slug: string;
  name: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  episode_current?: string;
  quality?: string;
  addedAt: number;
}
