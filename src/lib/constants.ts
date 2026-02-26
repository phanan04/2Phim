export const AUTOEMBED_BASE = "https://player.autoembed.cc";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Fallback to empty string – user must set TMDB_API_KEY in .env.local
export const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";

export const TMDB_IMG = {
  poster: (path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342") =>
    path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/placeholder-poster.svg",
  backdrop: (path: string | null, size: "w780" | "w1280" | "original" = "w1280") =>
    path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/placeholder-backdrop.svg",
};

// A tiny 10×15 gray JPEG encoded as base64 for blur placeholder
export const TMDB_BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAUAA8DASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAIhAAAQQCAgMBAAAAAAAAAAAAAQIDBBEhBRIxQVH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Ar1Nc1GG4NaSCFjJIwCe5HzwPPfjFLQ6pIxsDXuYY3R/G3YUfmACQQMkevPbFVtq8zG2UjWNBDGFzBgnkj5zjjHxipO1RRoHtexrmB2OQCAQOf8xQB//Z";

// AutoEmbed - server: 1 (default), 2, 3, 4
export const AUTOEMBED = {
  movie: (tmdbId: string | number, server = 1) =>
    `${AUTOEMBED_BASE}/embed/movie/${tmdbId}${server > 1 ? `?server=${server}` : ""}`,
  tv: (tmdbId: string | number, season: number, episode: number, server = 1) =>
    `${AUTOEMBED_BASE}/embed/tv/${tmdbId}/${season}/${episode}${server > 1 ? `?server=${server}` : ""}`,
};

// VidSrc has 4 working domains - try each in order
export const VIDSRC_DOMAINS = [
  "https://vidsrcme.su",
  "https://vidsrc-embed.su",
  "https://vsrc.su",
  "https://vidsrc-embed.ru",
];

// Primary domain (non-.ru to avoid blocks)
export const VIDSRC_BASE = VIDSRC_DOMAINS[0];

export const VIDSRC_EMBED = {
  movie: (tmdbId: string | number, domain = VIDSRC_BASE) => `${domain}/embed/movie/${tmdbId}`,
  tv: (tmdbId: string | number, season: number, episode: number, domain = VIDSRC_BASE) =>
    `${domain}/embed/tv/${tmdbId}/${season}-${episode}`,
};

// 2embed.cc - has built-in quality selector (360p/480p/720p/1080p)
export const TWOEMBED = {
  movie: (tmdbId: string | number) =>
    `https://www.2embed.cc/embed/${tmdbId}`,
  tv: (tmdbId: string | number, season: number, episode: number) =>
    `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
};

// vidlink.pro - multi-quality HLS player
export const VIDLINK = {
  movie: (tmdbId: string | number) =>
    `https://vidlink.pro/movie/${tmdbId}?autoplay=true`,
  tv: (tmdbId: string | number, season: number, episode: number) =>
    `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=true`,
};

export const VIDSRC_API = {
  latestMovies: (page: number, domain = VIDSRC_BASE) => `${domain}/movies/latest/page-${page}.json`,
  latestTV: (page: number, domain = VIDSRC_BASE) => `${domain}/tvshows/latest/page-${page}.json`,
  latestEpisodes: (page: number, domain = VIDSRC_BASE) => `${domain}/episodes/latest/page-${page}.json`,
};

// ─── Nguon C ────────────────────────────────────────────────────────────────
// Public API: https://phim.nguonc.com/api/
export const NGUONC_BASE = "https://phim.nguonc.com";

export const NGUONC_API = {
  latestFilms:  (page: number) => `${NGUONC_BASE}/api/films/phim-moi-cap-nhat?page=${page}`,
  filmDetail:   (slug: string) => `${NGUONC_BASE}/api/film/${slug}`,
  search:       (keyword: string, page = 1) => `${NGUONC_BASE}/api/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`,
};

// ─── OPhim ──────────────────────────────────────────────────────────────────
// Public API: https://ophim1.com/ — same format as KKPhim
export const OPHIM_BASE = "https://ophim1.com";
export const OPHIM_IMG  = "https://img.ophim.live/uploads/movies/";

export const OPHIM_API = {
  latestFilms: (page: number) => `${OPHIM_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`,
  filmDetail:  (slug: string) => `${OPHIM_BASE}/phim/${slug}`,
  search:      (keyword: string, page = 1) => `${OPHIM_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
};

// ─── KKPhim (via phimapi.com) ────────────────────────────────────────────────
// KKPhim's public API is served at phimapi.com — identical JSON schema to OPhim
export const KKPHIM_BASE = "https://phimapi.com";
export const KKPHIM_IMG  = "https://phimimg.com/upload/vod/";

export const KKPHIM_API = {
  latestFilms: (page: number) => `${KKPHIM_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`,
  filmDetail:  (slug: string) => `${KKPHIM_BASE}/phim/${slug}`,
  search:      (keyword: string, page = 1) => `${KKPHIM_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
};
