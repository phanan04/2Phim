import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { phimApi } from '../api/phimApi';
import { MovieDetail, MovieItem, EpisodeData } from '../types/movie';
import { getImageUrl } from '../utils/image';
import { storage } from '../utils/storage';
import { MovieCarousel } from '../components/common/MovieCarousel';
import { MovieComments } from '../components/movie/MovieComments';
import { TrailerModal } from '../components/common/TrailerModal';
import {
  Play,
  Heart,
  Share2,
  Calendar,
  Clock,
  Film,
  Globe,
  Tag,
  User,
  Check,
  Video,
  Sparkles,
  Star,
  MessageSquare,
  ArrowUpDown,
  RotateCcw,
  Search,
  Tv,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Hoathinh3D-style interactive state
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to latest episode first (like hoathinh3d)
  const [searchEpQuery, setSearchEpQuery] = useState('');
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [activeFranchiseTab, setActiveFranchiseTab] = useState<'main' | 'related'>('main');

  // Rating modal & local state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);
    setSearchEpQuery('');
    setActiveServerIdx(0);

    // Check existing user rating
    const savedRating = localStorage.getItem(`rating_${slug}`);
    if (savedRating) {
      setUserRating(Number(savedRating));
      setHasRated(true);
    } else {
      setUserRating(null);
      setHasRated(false);
    }

    async function fetchDetail() {
      try {
        const res = await phimApi.getMovieDetail(slug!);
        if (!isMounted) return;

        setMovie(res.movie);
        setIsBookmarked(storage.isBookmarked(res.movie.slug));

        document.title = `${res.movie.name} (${res.movie.year}) - 2 Phim`;

        const firstCategory = res.movie.category?.[0]?.slug;
        if (firstCategory) {
          const relRes = await phimApi.getMoviesByCategory(firstCategory, 1, 12);
          if (isMounted) {
            setRelatedMovies(relRes.items.filter((m) => m.slug !== slug));
          }
        }
      } catch (err) {
        console.error('Detail fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleToggleBookmark = () => {
    if (!movie) return;
    const added = storage.toggleBookmark({
      slug: movie.slug,
      name: movie.name,
      origin_name: movie.origin_name,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      year: movie.year,
      episode_current: movie.episode_current,
      quality: movie.quality,
    });
    setIsBookmarked(added);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRateMovie = (score: number) => {
    if (!slug) return;
    localStorage.setItem(`rating_${slug}`, score.toString());
    setUserRating(score);
    setHasRated(true);
    setIsRatingModalOpen(false);
  };

  // Safe server and episodes retrieval
  const currentServer = movie?.episodes?.[activeServerIdx] || movie?.episodes?.[0];
  const allEpisodes = currentServer?.server_data || [];

  // Filter & sort episodes
  const filteredEpisodes = useMemo(() => {
    let list = [...allEpisodes];

    // Search filter by episode name/number
    if (searchEpQuery.trim()) {
      const q = searchEpQuery.trim().toLowerCase();
      list = list.filter((ep) => ep.name.toLowerCase().includes(q) || ep.slug.toLowerCase().includes(q));
    }

    // Sort order
    if (sortOrder === 'desc') {
      list.reverse();
    }

    return list;
  }, [allEpisodes, searchEpQuery, sortOrder]);

  // Primary Watch CTA Link (Play latest or first episode)
  const primaryEpisode = allEpisodes.length > 0 ? allEpisodes[allEpisodes.length - 1] : null;
  const primaryWatchUrl = primaryEpisode
    ? `/xem/${movie?.slug}/${primaryEpisode.slug}#tap=${primaryEpisode.slug}&sv=${encodeURIComponent(currentServer?.server_name || '')}&channel=0&server_id=0`
    : `/xem/${movie?.slug}`;

  // Age rating badge
  const ageRating = useMemo(() => {
    const s = movie?.slug || '';
    if (s.includes('kinh-di') || s.includes('sat-nhan')) return 'T18';
    if (s.includes('hanh-dong') || s.includes('chien-tranh')) return 'T16';
    if (s.includes('hoat-hinh') || s.includes('anime')) return 'P';
    return 'T13';
  }, [movie?.slug]);

  // Rating display calculation
  const ratingScore = useMemo(() => {
    if (userRating) return (userRating * 2).toFixed(1); // 5-star to 10-scale
    if (movie?.tmdb?.vote_average) return movie.tmdb.vote_average.toFixed(1);
    if (movie?.imdb?.vote_average) return movie.imdb.vote_average.toFixed(1);
    return '9.2';
  }, [movie, userRating]);

  const ratingVoteCount = useMemo(() => {
    if (movie?.tmdb?.vote_count) return movie.tmdb.vote_count.toLocaleString('vi-VN');
    if (movie?.imdb?.vote_count) return movie.imdb.vote_count.toLocaleString('vi-VN');
    return '24.520';
  }, [movie]);

  if (loading) {
    return (
      <div className="py-12 space-y-6 animate-pulse max-w-4xl mx-auto px-4">
        <div className="h-96 bg-white/5 rounded-3xl" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-white">Không tìm thấy phim yêu cầu</h2>
        <p className="text-sm text-white/50">Phim có thể đã bị gỡ hoặc đường dẫn không chính xác.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full liquid-cta-primary font-bold text-xs"
        >
          Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const backdropUrl = getImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div className="relative min-h-screen pb-24">
      {/* 1. AMBIENT GLOW BACKDROP (Apple VisionOS / Hoathinh3D Style) */}
      <div className="absolute top-0 inset-x-0 h-[680px] pointer-events-none overflow-hidden select-none -z-10">
        <img
          src={posterUrl}
          alt={movie.name}
          className="w-full h-full object-cover object-center filter blur-[110px] saturate-200 opacity-25 scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/40 via-[#050507]/80 to-[#050507]" />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 space-y-7 pt-2 sm:pt-4">
        {/* 2. MAIN CARD HERO PRESENTATION */}
        <div className="relative rounded-3xl liquid-glass p-5 sm:p-8 md:p-10 shadow-2xl border border-white/15">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Poster 2:3 Vertical Card */}
            <div className="shrink-0 relative group">
              <div className="w-48 sm:w-56 md:w-60 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 relative artwork-poster-card">
                <img
                  src={posterUrl}
                  alt={movie.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge on Poster */}
                {movie.episode_current && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-black uppercase rounded-full bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-md">
                    {movie.episode_current}
                  </span>
                )}

                {/* Quality Badge on Poster */}
                {movie.quality && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {movie.quality}
                  </span>
                )}

                {/* Hover Play Action Overlay */}
                <Link
                  to={primaryWatchUrl}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  title="Xem ngay từ đầu"
                >
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.6)] group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Movie Identity & Metadata */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              {/* Title & Origin Name */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                  {movie.name}
                </h1>
                {movie.origin_name && (
                  <p className="text-sm sm:text-base text-white/60 font-semibold mt-1">
                    {movie.origin_name}
                  </p>
                )}
              </div>

              {/* Genre Pills Row (Hoathinh3D style rounded pills) */}
              {movie.category && movie.category.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-0.5">
                  {movie.category.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/kham-pha?category=${cat.slug}`}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Status & Key Meta Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
                {movie.episode_current && (
                  <span className="px-3 py-1 rounded-full font-bold bg-sky-500/20 border border-sky-500/40 text-sky-300">
                    {movie.episode_current}
                  </span>
                )}

                {movie.year && (
                  <span className="px-3 py-1 rounded-full font-semibold liquid-pill text-white/90 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/70" />
                    <span>{movie.year}</span>
                  </span>
                )}

                <span className="px-3 py-1 rounded-full font-semibold liquid-pill text-white/90 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white/70" />
                  <span>{movie.time || movie.episode_total || 'Đang cập nhật'}</span>
                </span>

                <span className="px-2.5 py-1 rounded-full font-black text-[11px] bg-red-600/80 text-white border border-red-500/50">
                  {ageRating}
                </span>
              </div>

              {/* Star Rating Display */}
              <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-base font-extrabold text-white">{ratingScore}</span>
                  <span className="text-xs text-white/50">/ 10</span>
                </div>
                <span className="text-xs text-white/50">({ratingVoteCount} lượt bình chọn)</span>
              </div>

              {/* Secondary Action Toolbar: Đánh Giá, Theo Dõi, Bình Luận */}
              <div className="flex items-center justify-center md:justify-start gap-2.5 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/30 flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{hasRated ? `Đã đánh giá (${userRating}★)` : 'Đánh giá'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isBookmarked
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'liquid-pill text-white/90 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-white' : ''}`} />
                  <span>{isBookmarked ? 'Đang theo dõi' : 'Theo dõi'}</span>
                  <span className="text-[10px] opacity-75 font-normal ml-0.5">23.0k</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToComments}
                  className="px-4 py-2 rounded-full text-xs font-bold liquid-pill text-white/90 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white/80" />
                  <span>Bình luận</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-full liquid-pill text-white/80 hover:text-white cursor-pointer"
                  title="Chia sẻ phim"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Giant Primary Action Button (XEM PHIM NGAY) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to={primaryWatchUrl}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-full text-center font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Xem Phim</span>
                </Link>

                {movie.trailer_url && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full liquid-pill text-xs font-bold text-white hover:text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-white/80" />
                    <span>Xem Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. FRANCHISE / PHẦN PHIM TABS (Các phần phim cùng vũ trụ) */}
        {relatedMovies.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveFranchiseTab('main')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFranchiseTab === 'main'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-md'
                  : 'liquid-pill text-white/70 hover:text-white'
              }`}
            >
              Phần Chính
            </button>

            {relatedMovies.slice(0, 3).map((rel) => (
              <Link
                key={rel.slug}
                to={`/phim/${rel.slug}`}
                className="px-4 py-2 rounded-full text-xs font-medium liquid-pill text-white/70 hover:text-white shrink-0 truncate max-w-[200px]"
                title={rel.name}
              >
                {rel.name}
              </Link>
            ))}
          </div>
        )}

        {/* 4. BROADCAST SCHEDULE NOTIFICATION BAR */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200/90 flex items-center gap-2.5 shadow-lg">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="line-clamp-2">
            {movie.type === 'series' || movie.type === 'hoathinh' ? (
              <span>
                <strong>Lịch phát sóng:</strong> Cập nhật tập mới đều đặn hàng tuần • Chất lượng Full HD Vietsub & Thuyết minh.
              </span>
            ) : (
              <span>
                <strong>Trạng thái:</strong> Bản Đẹp Vietsub + Thuyết Minh Chuẩn Điện Ảnh 4K/FHD.
              </span>
            )}
          </p>
        </div>

        {/* 5. EPISODE SELECTOR SECTION ("CHỌN TẬP") */}
        {movie.episodes && movie.episodes.length > 0 && (
          <div className="rounded-3xl liquid-glass p-5 sm:p-7 shadow-xl border border-white/15 space-y-4">
            {/* Header & Episode Controls Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-white/80" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Chọn Tập
                </h3>
                <span className="text-xs text-white/50 font-bold ml-1">
                  ({filteredEpisodes.length}/{allEpisodes.length} tập)
                </span>
              </div>

              {/* Action Toolbar: Sắp xếp, Refresh, Tìm kiếm số tập */}
              <div className="flex items-center gap-2">
                {/* Nút Đảo chiều sắp xếp (Mới nhất trước / Cũ nhất trước) */}
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1.5 rounded-full liquid-pill text-xs font-bold text-white/80 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  title="Đảo thứ tự tập"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {sortOrder === 'desc' ? 'Tập mới trước' : 'Tập 1 trước'}
                  </span>
                </button>

                {/* Nút Refresh */}
                <button
                  type="button"
                  onClick={() => {
                    setSearchEpQuery('');
                    setSortOrder('desc');
                  }}
                  className="p-2 rounded-full liquid-pill text-white/80 hover:text-white cursor-pointer"
                  title="Đặt lại danh sách"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Ô tìm kiếm số tập nhanh */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchEpQuery}
                    onChange={(e) => setSearchEpQuery(e.target.value)}
                    placeholder="Nhập số tập..."
                    className="w-32 sm:w-40 h-8 pl-7 pr-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-2 top-2.5" />
                  {searchEpQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchEpQuery('')}
                      className="absolute right-2 top-2.5 text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Server Tabs */}
            {movie.episodes.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {movie.episodes.map((sv, idx) => (
                  <button
                    key={sv.server_name}
                    type="button"
                    onClick={() => setActiveServerIdx(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      activeServerIdx === idx
                        ? 'bg-white text-black font-extrabold shadow-md'
                        : 'liquid-pill text-white/70 hover:text-white'
                    }`}
                  >
                    <Tv className="w-3 h-3" />
                    <span>{sv.server_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Episode Grid (8 cols on desktop, scrollable container) */}
            {filteredEpisodes.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1 pt-1">
                {filteredEpisodes.map((ep) => {
                  const watchEpUrl = `/xem/${movie.slug}/${ep.slug}#tap=${ep.slug}&sv=${encodeURIComponent(currentServer?.server_name || '')}&channel=0&server_id=0`;
                  return (
                    <Link
                      key={ep.slug}
                      to={watchEpUrl}
                      className="py-2 px-1 text-center rounded-xl liquid-pill text-xs sm:text-sm font-bold text-white/90 hover:text-black hover:bg-white transition-all truncate border border-white/10 hover:border-white shadow-sm"
                      title={ep.name}
                    >
                      {ep.name}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/50">
                Không tìm thấy tập nào khớp với từ khóa "{searchEpQuery}".
              </div>
            )}
          </div>
        )}

        {/* 6. SYNOPSIS & MOVIE OVERVIEW ("| NỘI DUNG") */}
        <div className="rounded-3xl liquid-glass p-5 sm:p-7 shadow-xl border border-white/15 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              Nội Dung Phim
            </h3>
          </div>

          <div className="relative">
            <div
              className={`text-xs sm:text-sm text-white/80 leading-relaxed space-y-3 transition-all ${
                !isContentExpanded ? 'line-clamp-4' : ''
              }`}
              dangerouslySetInnerHTML={{
                __html: movie.content || 'Nội dung phim đang được cập nhật...',
              }}
            />

            {/* Expand / Collapse Button */}
            {movie.content && movie.content.length > 250 && (
              <button
                type="button"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>{isContentExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                {isContentExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Additional Meta Tags: Casts, Director, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs text-white/70">
            {movie.director && movie.director.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-white/50">Đạo diễn:</span>
                <span className="font-semibold text-white truncate">{movie.director.join(', ')}</span>
              </div>
            )}

            {movie.country && movie.country.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-white/50">Quốc gia:</span>
                <span className="font-semibold text-white">
                  {movie.country.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/kham-pha?country=${c.slug}`}
                      className="hover:underline hover:text-white mr-1.5"
                    >
                      {c.name}
                    </Link>
                  ))}
                </span>
              </div>
            )}

            {movie.actor && movie.actor.length > 0 && (
              <div className="col-span-1 sm:col-span-2 flex items-start gap-2">
                <span className="text-white/50 shrink-0">Diễn viên:</span>
                <span className="font-semibold text-white/90 leading-relaxed">
                  {movie.actor.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 7. COMMUNITY COMMENTS SECTION */}
        <div ref={commentsRef} className="pt-2">
          <MovieComments movieSlug={movie.slug} movieName={movie.name} />
        </div>

        {/* 8. RECOMMENDED RELATED MOVIES CAROUSEL */}
        {relatedMovies.length > 0 && (
          <div className="pt-4">
            <MovieCarousel title="Phim Cùng Thể Loại Đề Xuất" movies={relatedMovies} />
          </div>
        )}
      </div>

      {/* RATING MODAL POPUP */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-3xl liquid-glass border border-white/20 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Đánh giá phim</h3>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70">
              Bạn đánh giá thế nào về <strong>{movie.name}</strong>?
            </p>

            {/* 5-Star Selection Row */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRateMovie(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer text-amber-400"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || userRating || 0) >= star ? 'fill-current text-amber-400' : 'text-white/30'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs text-white/50">
              {(hoverRating || userRating || 0) > 0 ? (
                <span className="text-amber-400 font-bold">
                  {(hoverRating || userRating || 0) * 2} / 10 điểm
                </span>
              ) : (
                'Nhấp vào ngôi sao để chấm điểm'
              )}
            </p>
          </div>
        </div>
      )}

      {/* TRAILER MODAL DIALOG */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movieName={movie.name}
        trailerUrl={movie.trailer_url || undefined}
      />
    </div>
  );
};
