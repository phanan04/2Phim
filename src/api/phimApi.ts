import { MovieDetail, MovieItem, MovieListResponse, EpisodeServer, EpisodeData } from '../types/movie';

const PRIMARY_API = 'https://phimapi.com';
const BACKUP_API = 'https://ophim1.com';
const NGUONC_API = 'https://phim.nguonc.com/api';

// In-memory cache + SessionStorage for extreme speed and load reduction
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

async function fetchWithResilience<T>(url: string): Promise<T> {
  const now = Date.now();

  // 1. Check RAM Cache
  const cached = memoryCache.get(url);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  // 2. Check SessionStorage
  try {
    const sessionItem = sessionStorage.getItem(`cache_${url}`);
    if (sessionItem) {
      const parsed = JSON.parse(sessionItem);
      if (now - parsed.timestamp < CACHE_TTL) {
        memoryCache.set(url, parsed);
        return parsed.data as T;
      }
    }
  } catch {}

  // 3. Fetch from Network with Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

  try {
    const res = await fetch(url, { credentials: 'omit', signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const entry = { data, timestamp: now };
    memoryCache.set(url, entry);
    try {
      sessionStorage.setItem(`cache_${url}`, JSON.stringify(entry));
    } catch {}

    return data as T;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Hàm ưu tiên chọn Server Tiếng Việt mượt mà nhất (ưu tiên server có luồng HLS m3u8)
export function getPreferredServerIndex(episodes: EpisodeServer[]): number {
  if (!episodes || episodes.length === 0) return 0;

  // Lọc các server có luồng HLS m3u8
  const hlsCandidates = episodes
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => s.server_data?.some((e) => e.link_m3u8 && e.link_m3u8.trim() !== ''));

  const pool = hlsCandidates.length > 0 ? hlsCandidates : episodes.map((s, idx) => ({ s, idx }));

  // Thứ tự ưu tiên Tiếng Việt: Thuyết Minh -> Lồng Tiếng -> Song Ngữ -> Vietsub
  const priorities = [
    /thuyết\s*minh/i,
    /lồng\s*tiếng/i,
    /song\s*ngữ/i,
    /vietsub/i,
  ];

  for (const regex of priorities) {
    const found = pool.find(({ s }) => regex.test(s.server_name));
    if (found) return found.idx;
  }

  return pool[0]?.idx ?? 0;
}

export const phimApi = {
  // Phim mới cập nhật (Trang chủ)
  async getNewUpdates(page: number = 1): Promise<{ items: MovieItem[]; pagination: any }> {
    const data = await fetchWithResilience<any>(`${PRIMARY_API}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    return {
      items: data.items || [],
      pagination: data.pagination,
    };
  },

  // Chi tiết phim - Đa nguồn (PhimAPI + NguonC + Multi-CDN Servers)
  async getMovieDetail(slug: string): Promise<{ movie: MovieDetail; episodes: EpisodeServer[] }> {
    // 1. Fetch chính từ PhimAPI
    const primaryData = await fetchWithResilience<any>(`${PRIMARY_API}/phim/${slug}`);
    if (!primaryData.movie) {
      throw new Error(primaryData.msg || 'Không tìm thấy phim');
    }

    const baseEpisodes: EpisodeServer[] = primaryData.episodes || [];
    const aggregatedServers: EpisodeServer[] = [];

    // Chuẩn hóa server chính từ PhimAPI
    for (const s of baseEpisodes) {
      aggregatedServers.push({
        server_name: s.server_name.includes('HLS') ? s.server_name : `${s.server_name} (HLS Siêu Tốc)`,
        server_data: s.server_data,
      });
    }

    // 2. Fetch dự phòng từ NguonC nếu có
    try {
      const nguonCRes = await fetch(`${NGUONC_API}/film/${slug}`, { signal: AbortSignal.timeout(4000) });
      if (nguonCRes.ok) {
        const nguonCData = await nguonCRes.json();
        if (nguonCData.status === 'success' && nguonCData.movie?.episodes?.length > 0) {
          for (const s of nguonCData.movie.episodes) {
            const serverLabel = `Nguồn C (${s.server_name || 'Vietsub'})`;
            const epItems: EpisodeData[] = (s.items || []).map((it: any) => ({
              name: String(it.name).startsWith('Tập') ? String(it.name) : `Tập ${it.name}`,
              slug: String(it.slug),
              filename: String(it.name),
              link_embed: it.embed || '',
              link_m3u8: it.m3u8 || '',
            }));

            // Chỉ thêm Nguồn C nếu có luồng m3u8 hoặc server chính chưa có tập nào
            const hasM3u8 = epItems.some((e) => e.link_m3u8 && e.link_m3u8.trim() !== '');
            if (epItems.length > 0 && (hasM3u8 || baseEpisodes.length === 0)) {
              aggregatedServers.push({
                server_name: serverLabel,
                server_data: epItems,
              });
            }
          }
        }
      }
    } catch {
      // Bỏ qua nếu Nguồn C không có
    }

    return {
      movie: {
        ...primaryData.movie,
        episodes: aggregatedServers,
      },
      episodes: aggregatedServers,
    };
  },

  // Danh sách theo loại (phim-bo, phim-le, phim-chieu-rap, hoat-hinh, tv-shows)
  async getMoviesByType(type: string, page: number = 1, limit: number = 20): Promise<{
    title: string;
    items: MovieItem[];
    pagination: any;
    cdnImage: string;
  }> {
    const data = await fetchWithResilience<MovieListResponse>(
      `${PRIMARY_API}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}`
    );

    const d = data.data;
    return {
      title: d?.titlePage || 'Danh sách phim',
      items: d?.items || [],
      pagination: d?.params?.pagination,
      cdnImage: d?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
    };
  },

  // Danh sách theo thể loại
  async getMoviesByCategory(categorySlug: string, page: number = 1, limit: number = 20): Promise<{
    title: string;
    items: MovieItem[];
    pagination: any;
    cdnImage: string;
  }> {
    const data = await fetchWithResilience<MovieListResponse>(
      `${PRIMARY_API}/v1/api/the-loai/${categorySlug}?page=${page}&limit=${limit}`
    );

    const d = data.data;
    return {
      title: d?.titlePage || 'Thể loại',
      items: d?.items || [],
      pagination: d?.params?.pagination,
      cdnImage: d?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
    };
  },

  // Danh sách theo quốc gia (Hàn Quốc, Trung Quốc, Âu Mỹ,...)
  async getMoviesByCountry(countrySlug: string, page: number = 1, limit: number = 20): Promise<{
    title: string;
    items: MovieItem[];
    pagination: any;
    cdnImage: string;
  }> {
    const data = await fetchWithResilience<MovieListResponse>(
      `${PRIMARY_API}/v1/api/quoc-gia/${countrySlug}?page=${page}&limit=${limit}`
    );

    const d = data.data;
    return {
      title: d?.titlePage || 'Quốc gia',
      items: d?.items || [],
      pagination: d?.params?.pagination,
      cdnImage: d?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
    };
  },

  // Tìm kiếm
  async searchMovies(keyword: string, page: number = 1, limit: number = 20): Promise<{
    title: string;
    items: MovieItem[];
    pagination: any;
    cdnImage: string;
  }> {
    const encoded = encodeURIComponent(keyword.trim());
    const data = await fetchWithResilience<MovieListResponse>(
      `${PRIMARY_API}/v1/api/tim-kiem?keyword=${encoded}&page=${page}&limit=${limit}`
    );

    const d = data.data;
    return {
      title: d?.titlePage || `Kết quả: ${keyword}`,
      items: d?.items || [],
      pagination: d?.params?.pagination,
      cdnImage: d?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
    };
  },
};

export const TOPIC_RIBBONS = [
  { label: 'Tất cả', id: 'all', path: '/' },
  { label: 'K-Drama Hàn Quốc', id: 'kdrama', path: '/quoc-gia/han-quoc' },
  { label: 'Cổ Trang Trung Quốc', id: 'cotrang', path: '/the-loai/co-trang' },
  { label: 'Thanh Xuân Vườn Trường', id: 'thanhxuan', path: '/the-loai/hoc-duong' },
  { label: 'Anime Mới', id: 'anime', path: '/danh-sach/hoat-hinh' },
  { label: 'Phim Chiếu Rạp', id: 'chieurap', path: '/danh-sach/phim-chieu-rap' },
  { label: 'Bom Tấn Âu Mỹ', id: 'aumy', path: '/quoc-gia/au-my' },
  { label: 'Phim Bộ Hot', id: 'phimbo', path: '/danh-sach/phim-bo' },
  { label: 'Phim Lẻ Mới', id: 'phimle', path: '/danh-sach/phim-le' },
];

export const CATEGORIES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Bí Ẩn', slug: 'bi-an' },
  { name: 'Phim Hài', slug: 'hai-huoc' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Thể Thao', slug: 'the-thao' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Âm Nhạc', slug: 'am-nhac' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Thần Thoại', slug: 'than-thoai' },
  { name: 'Chính Kịch', slug: 'chinh-kich' },
  { name: 'Hình Sự', slug: 'hinh-su' },
];

export const COUNTRIES = [
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Ấn Độ', slug: 'an-do' },
  { name: 'Anh', slug: 'anh' },
  { name: 'Pháp', slug: 'phap' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
];
