import { EpisodeData } from '../types/movie';

/**
 * Trích xuất số tập hoặc ký hiệu (ví dụ: 'tap-01' -> 1, 'Tập 15' -> 15, 'Full' -> 'full')
 */
export function extractEpisodeNumber(str: string | undefined | null): number | 'full' | null {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s.includes('full')) return 'full';
  const m = s.match(/(?:tap-?|tập\s*|^)(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Tìm tập tương ứng khi người dùng đổi server (VIP 1 <-> VIP 2 <-> VIP 3)
 * Giúp người dùng giữ nguyên vị trí tập đang xem thay vì bị reset về tập 1
 */
export function findMatchingEpisode(
  targetEpisodes: EpisodeData[],
  currentEpOrSlug: EpisodeData | string | null | undefined
): EpisodeData {
  if (!targetEpisodes || targetEpisodes.length === 0) {
    return {} as EpisodeData;
  }
  if (!currentEpOrSlug) {
    return targetEpisodes[0];
  }

  const currentSlug = typeof currentEpOrSlug === 'string' ? currentEpOrSlug : currentEpOrSlug.slug || '';
  const currentName = typeof currentEpOrSlug === 'string' ? currentEpOrSlug : currentEpOrSlug.name || '';

  // 1. Khớp chính xác slug (ví dụ 'tap-01' === 'tap-01')
  if (currentSlug) {
    const exactSlug = targetEpisodes.find(
      (e) => e.slug && e.slug.toLowerCase() === currentSlug.toLowerCase()
    );
    if (exactSlug) return exactSlug;
  }

  // 2. Khớp theo số tập thông minh (ví dụ: 'tap-05' khớp 'tap-5', 'Tập 5', '5')
  const currentNum = extractEpisodeNumber(currentSlug) ?? extractEpisodeNumber(currentName);
  if (currentNum !== null) {
    const matchByNum = targetEpisodes.find((e) => {
      const targetNum = extractEpisodeNumber(e.slug) ?? extractEpisodeNumber(e.name);
      return targetNum === currentNum;
    });
    if (matchByNum) return matchByNum;
  }

  // 3. Fallback: Nếu không tìm thấy, lấy tập đầu tiên của server mới
  return targetEpisodes[0];
}

/**
 * Rút gọn tên tập cho giao diện mobile (ví dụ: 'Tập 01' -> '01')
 */
export function getMobileEpisodeBadge(name: string): string {
  const clean = name.replace(/^Tập\s*/i, '').trim();
  return clean || name;
}
