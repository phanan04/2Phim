import { MovieDetail, MovieItem, MovieListResponse, EpisodeServer, EpisodeData, MovieCategory } from '../types/movie';

const PRIMARY_API = 'https://phimapi.com';
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
    // 1. Ưu tiên máy chủ HLS chính trước
    const foundHls = pool.find(({ s }) => regex.test(s.server_name) && !/dự\s*phòng|embed/i.test(s.server_name));
    if (foundHls) return foundHls.idx;

    // 2. Nếu không có thì lấy bất kỳ máy chủ nào khớp ngôn ngữ
    const foundAny = pool.find(({ s }) => regex.test(s.server_name));
    if (foundAny) return foundAny.idx;
  }

  return pool[0]?.idx ?? 0;
}

// Chuyển đổi dữ liệu từ NguonC sang MovieDetail nếu PhimAPI không có
function convertNguonCToMovieDetail(nc: any): MovieDetail {
  const cats: MovieCategory[] = [];
  if (nc.category) {
    Object.values(nc.category).forEach((groupObj: any) => {
      if (Array.isArray(groupObj?.list)) {
        groupObj.list.forEach((item: any) => {
          cats.push({ id: String(item.id || item.slug), name: item.name, slug: item.slug });
        });
      }
    });
  }

  const actors = typeof nc.casts === 'string' ? nc.casts.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const directors = typeof nc.director === 'string' ? [nc.director.trim()] : Array.isArray(nc.director) ? nc.director : [];

  return {
    _id: String(nc.id || nc.slug),
    name: nc.name || '',
    origin_name: nc.original_name || nc.name || '',
    slug: nc.slug || '',
    type: parseInt(nc.total_episodes, 10) > 1 ? 'series' : 'single',
    thumb_url: nc.thumb_url || nc.poster_url || '',
    poster_url: nc.poster_url || nc.thumb_url || '',
    time: nc.time || '',
    episode_current: nc.current_episode || '',
    episode_total: nc.total_episodes || '',
    quality: nc.quality || 'FHD',
    lang: nc.language || 'Vietsub',
    year: parseInt(nc.year, 10) || new Date().getFullYear(),
    content: nc.description?.replace(/<[^>]+>/g, '') || '',
    actor: actors,
    director: directors,
    category: cats,
    country: [],
    episodes: [],
  };
}

export interface MovieFilterOptions {
  type?: string;
  category?: string;
  country?: string;
  year?: string;
  sort?: string;
  page?: number;
  limit?: number;
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

  // Chi tiết phim - Đa nguồn dự phòng (PhimAPI chính + NguonC phụ)
  async getMovieDetail(slug: string): Promise<{ movie: MovieDetail; episodes: EpisodeServer[] }> {
    // 1. Fetch song song cả PhimAPI (chính) và NguonC (dự phòng)
    const [primaryResult, nguonCResult] = await Promise.allSettled([
      fetchWithResilience<any>(`${PRIMARY_API}/phim/${slug}`),
      fetch(`${NGUONC_API}/film/${slug}`, { signal: AbortSignal.timeout(4500) }).then((r) =>
        r.ok ? r.json() : null
      ),
    ]);

    const primaryData = primaryResult.status === 'fulfilled' ? primaryResult.value : null;
    const nguonCData = nguonCResult.status === 'fulfilled' ? nguonCResult.value : null;

    if (!primaryData?.movie && !nguonCData?.movie) {
      throw new Error('Không tìm thấy dữ liệu phim từ các nguồn máy chủ');
    }

    const aggregatedServers: EpisodeServer[] = [];

    // Nguồn chính từ PhimAPI (OPhim): Tách rõ ràng Máy chủ HLS Siêu Tốc và Máy chủ Dự Phòng VIP
    const baseEpisodes: EpisodeServer[] = primaryData?.episodes || [];

    // 1. Máy chủ HLS Siêu Tốc (Phát trực tiếp HLS m3u8 qua trình phát HTML5 siêu mượt)
    for (const s of baseEpisodes) {
      const serverLabel = `${s.server_name} #1 (HLS Siêu Tốc)`;
      aggregatedServers.push({
        server_name: serverLabel,
        server_data: s.server_data,
      });
    }

    // 2. Máy chủ Dự Phòng VIP (Phát qua trình phát nhúng Embed độc lập trên player.phimapi.com)
    for (const s of baseEpisodes) {
      const hasEmbed = s.server_data?.some((e) => e.link_embed && e.link_embed.trim() !== '');
      if (hasEmbed) {
        const serverLabel = `${s.server_name} #2 (Dự Phòng VIP)`;
        aggregatedServers.push({
          server_name: serverLabel,
          server_data: s.server_data,
        });
      }
    }

    // Nguồn 2: Server dự phòng từ NguonC (chỉ tích hợp khi có link m3u8 hoặc là cứu cánh duy nhất)
    if (nguonCData?.status === 'success' && nguonCData.movie?.episodes?.length > 0) {
      for (const s of nguonCData.movie.episodes) {
        const rawItems = s.items || [];
        // Nếu đã có máy chủ chính m3u8, chỉ nhận Nguồn C nếu có link m3u8 phát được (tránh embed streamc bị 403/SAMEORIGIN)
        const validItems = aggregatedServers.length > 0
          ? rawItems.filter((it: any) => Boolean(it.m3u8 && String(it.m3u8).trim() !== ''))
          : rawItems;

        const epItems: EpisodeData[] = validItems.map((it: any) => {
          const rawName = String(it.name || '').trim();
          const isFull = rawName.toLowerCase() === 'full';
          const epName = isFull || rawName.toLowerCase().startsWith('tập') ? rawName : `Tập ${rawName}`;
          return {
            name: epName,
            slug: String(it.slug || (isFull ? 'tap-full' : `tap-${rawName}`)),
            filename: String(it.name || ''),
            link_embed: it.embed || '',
            link_m3u8: it.m3u8 || '',
          };
        });

        if (epItems.length > 0) {
          const label = aggregatedServers.length > 0
            ? `Dự phòng Nguồn C (${s.server_name || 'Vietsub'})`
            : `${s.server_name || 'Vietsub'} (Nguồn C)`;

          aggregatedServers.push({
            server_name: label,
            server_data: epItems,
          });
        }
      }
    }

    const baseMovie = primaryData?.movie || convertNguonCToMovieDetail(nguonCData.movie);

    return {
      movie: {
        ...baseMovie,
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

  // Lấy danh sách phim Khám Phá với đầy đủ bộ lọc phía máy chủ (Server-Side Filtering)
  async getExploreMovies(options: MovieFilterOptions): Promise<{
    title: string;
    items: MovieItem[];
    pagination: any;
    cdnImage: string;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 24;

    let base = `${PRIMARY_API}/v1/api/danh-sach/phim-moi-cap-nhat`;
    if (options.type && options.type !== 'all') {
      base = `${PRIMARY_API}/v1/api/danh-sach/${options.type}`;
    } else if (options.category && options.category !== 'all') {
      base = `${PRIMARY_API}/v1/api/the-loai/${options.category}`;
    } else if (options.country && options.country !== 'all') {
      base = `${PRIMARY_API}/v1/api/quoc-gia/${options.country}`;
    }

    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('limit', String(limit));

    if (options.category && options.category !== 'all' && !base.includes('/the-loai/')) {
      query.set('category', options.category);
    }
    if (options.country && options.country !== 'all' && !base.includes('/quoc-gia/')) {
      query.set('country', options.country);
    }
    if (options.year && options.year !== 'all') {
      query.set('year', options.year);
    }
    if (options.sort === 'year') {
      query.set('sort_field', 'year');
      query.set('sort_type', 'desc');
    }

    const data = await fetchWithResilience<MovieListResponse>(`${base}?${query.toString()}`);
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
