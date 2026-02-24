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
