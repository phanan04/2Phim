import { VIDSRC_DOMAINS, VIDSRC_API } from "@/lib/constants";
import type { VidSrcMovie, VidSrcTVShow, VidSrcEpisode, VidSrcListResponse } from "@/types";

// Try each VidSrc domain in order until one succeeds
async function fetchWithFallback(buildUrl: (domain: string) => string): Promise<Response> {
  let lastError: unknown;
  for (const domain of VIDSRC_DOMAINS) {
    try {
      const res = await fetch(buildUrl(domain), {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return res;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error("All VidSrc domains failed");
}

export async function getLatestVidSrcMovies(page = 1): Promise<VidSrcListResponse<VidSrcMovie>> {
  const res = await fetchWithFallback((d) => VIDSRC_API.latestMovies(page, d));
  return res.json();
}

export async function getLatestVidSrcTV(page = 1): Promise<VidSrcListResponse<VidSrcTVShow>> {
  const res = await fetchWithFallback((d) => VIDSRC_API.latestTV(page, d));
  return res.json();
}

export async function getLatestVidSrcEpisodes(
  page = 1
): Promise<VidSrcListResponse<VidSrcEpisode>> {
  const res = await fetchWithFallback((d) => VIDSRC_API.latestEpisodes(page, d));
  return res.json();
}

