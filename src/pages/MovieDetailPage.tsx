import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { phimApi } from '../api/phimApi';
import { MovieDetail, MovieItem } from '../types/movie';
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
  Star,
  MessageSquare,
  ArrowUpDown,
  RotateCcw,
  Search,
  Tv,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Video,
} from 'lucide-react';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Episode interactive state
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to latest episode first
  const [searchEpQuery, setSearchEpQuery] = useState('');
  const [isContentExpanded, setIsContentExpanded] = useState(false);

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
    if (userRating) return (userRating * 2).toFixed(1);
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
      <div className="py-8 space-y-6 animate-pulse max-w-5xl mx-auto px-4">
        <div className="h-80 bg-white/5 rounded-xl" />
        <div className="h-48 bg-white/5 rounded-xl" />
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
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-black font-bold text-xs"
        >
          Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8 select-none">
      {/* 1. SEAMLESS TOP HERO (ĐỒNG BỘ CHỦ ĐỀ OBSIDIAN & WHITE GLASS) */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-2">
        {/* Left: Poster (Sleek rounded-xl, 2:3 ratio) */}
        <div className="w-48 sm:w-56 shrink-0 mx-auto md:mx-0">
          <div className="aspect-[2/3] w-full rounded-xl overflow-hidden shadow-2xl relative border border-white/10 group bg-[#111115]">
            <img
              src={posterUrl}
              alt={movie.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges on Poster */}
            {movie.episode_current && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-bold rounded bg-black/80 backdrop-blur-sm text-white border border-white/15">
                {movie.episode_current}
              </span>
            )}
            {movie.quality && (
              <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-white/20 backdrop-blur-sm text-white border border-white/20">
                {movie.quality}
              </span>
            )}

            {/* Hover Play Button Overlay */}
            <Link
              to={primaryWatchUrl}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              title="Xem ngay từ đầu"
            >
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right: Info, Meta, & Actions */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {movie.name}
            </h1>
            {movie.origin_name && (
              <p className="text-sm sm:text-base text-white/60 font-medium mt-1">
                {movie.origin_name}
              </p>
            )}
          </div>

          {/* Genre Chips (Đồng bộ monochrome glass) */}
          {movie.category && movie.category.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {movie.category.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/kham-pha?category=${cat.slug}`}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/8 text-white/80 hover:text-white hover:bg-white/15 border border-white/10 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Key Metadata Badges (Đồng bộ trắng mờ frosted glass) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
            {movie.episode_current && (
              <span className="px-2.5 py-1 rounded-md font-bold bg-white/10 text-white border border-white/15">
                {movie.episode_current}
              </span>
            )}
            {movie.year && (
              <span className="px-2.5 py-1 rounded-md font-medium bg-white/5 border border-white/10 flex items-center gap-1 text-white/80">
                <Calendar className="w-3.5 h-3.5 text-white/60" />
                <span>{movie.year}</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-md font-medium bg-white/5 border border-white/10 flex items-center gap-1 text-white/80">
              <Clock className="w-3.5 h-3.5 text-white/60" />
              <span>{movie.time || movie.episode_total || 'Đang cập nhật'}</span>
            </span>
            <span className="px-2 py-0.5 rounded font-black text-[11px] bg-white/10 text-white border border-white/15">
              {ageRating}
            </span>

            {/* Star Rating */}
            <div className="flex items-center gap-1.5 ml-1 text-xs">
              <Star className="w-4 h-4 fill-current text-white/90" />
              <span className="font-bold text-white text-sm">{ratingScore}</span>
              <span className="text-white/40">/ 10</span>
              <span className="text-white/40 text-[11px]">({ratingVoteCount})</span>
            </div>
          </div>

          {/* Action Buttons Row (Đồng bộ Apple Obsidian & White) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Primary Action Button (Trắng tinh thể nổi bật) */}
            <Link
              to={primaryWatchUrl}
              className="px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Xem Phim</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsRatingModalOpen(true)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{hasRated ? `Đã đánh giá (${userRating}★)` : 'Đánh giá'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-white/90 border-white/10'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-black' : ''}`} />
              <span>{isBookmarked ? 'Đang theo dõi' : 'Theo dõi'}</span>
            </button>

            <button
              type="button"
              onClick={scrollToComments}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white/70" />
              <span>Bình luận</span>
            </button>

            {movie.trailer_url && (
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-white/70" />
                <span>Trailer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 cursor-pointer transition-colors"
              title="Chia sẻ phim"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Clean Schedule Notice */}
          <div className="pt-2 text-xs text-white/60 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/60 shrink-0" />
            <span>
              {movie.type === 'series' || movie.type === 'hoathinh'
                ? 'Lịch chiếu: Cập nhật tập mới đều đặn hàng tuần • Bản Vietsub & Thuyết minh Full HD.'
                : 'Bản Đẹp Vietsub & Thuyết Minh Chuẩn Điện Ảnh.'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CHỌN TẬP SECTION (LIỀN MẠCH, ĐỒNG BỘ MÀU) */}
      {movie.episodes && movie.episodes.length > 0 && (
        <div className="pt-6 border-t border-white/10 space-y-3.5">
          {/* Header & Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Chọn Tập
              </h2>
              <span className="text-xs text-white/50 font-medium">
                ({filteredEpisodes.length}/{allEpisodes.length} tập)
              </span>
            </div>

            {/* Toolbar Buttons: Đảo thứ tự, Đặt lại, Tìm tập */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Đảo thứ tự tập"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortOrder === 'desc' ? 'Tập mới trước' : 'Tập 1 trước'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchEpQuery('');
                  setSortOrder('desc');
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Đặt lại danh sách"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="relative">
                <input
                  type="text"
                  value={searchEpQuery}
                  onChange={(e) => setSearchEpQuery(e.target.value)}
                  placeholder="Nhập số tập..."
                  className="w-32 sm:w-36 h-8 pl-7 pr-3 rounded-lg bg-[#141418] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
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

          {/* Server Switcher (if multiple servers exist) */}
          {movie.episodes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {movie.episodes.map((sv, idx) => (
                <button
                  key={sv.server_name}
                  type="button"
                  onClick={() => setActiveServerIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeServerIdx === idx
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  <Tv className="w-3 h-3" />
                  <span>{sv.server_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Episode Grid (8 cols on lg, 6 cols on sm/md, 4 cols on mobile) */}
          {filteredEpisodes.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1 pt-1">
              {filteredEpisodes.map((ep) => {
                const watchEpUrl = `/xem/${movie.slug}/${ep.slug}#tap=${ep.slug}&sv=${encodeURIComponent(currentServer?.server_name || '')}&channel=0&server_id=0`;
                return (
                  <Link
                    key={ep.slug}
                    to={watchEpUrl}
                    className="py-2 px-1 text-center rounded-lg bg-white/5 hover:bg-white text-white/80 hover:text-black font-semibold text-xs transition-colors truncate border border-white/10"
                    title={ep.name}
                  >
                    {ep.name}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-white/40">
              Không tìm thấy tập nào khớp với từ khóa "{searchEpQuery}".
            </div>
          )}
        </div>
      )}

      {/* 3. NỘI DUNG PHIM (ĐỒNG BỘ CHỦ ĐỀ) */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wide">
            Nội Dung Phim
          </h2>
        </div>

        <div className="relative">
          <div
            className={`text-xs sm:text-sm text-white/75 leading-relaxed space-y-3 ${
              !isContentExpanded ? 'line-clamp-4' : ''
            }`}
            dangerouslySetInnerHTML={{
              __html: movie.content || 'Nội dung phim đang được cập nhật...',
            }}
          />

          {movie.content && movie.content.length > 250 && (
            <button
              type="button"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="mt-2 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{isContentExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
              {isContentExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Cast, Director & Country Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-xs text-white/70">
          {movie.director && movie.director.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/40">Đạo diễn:</span>
              <span className="font-medium text-white truncate">{movie.director.join(', ')}</span>
            </div>
          )}

          {movie.country && movie.country.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/40">Quốc gia:</span>
              <span className="font-medium text-white">
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
              <span className="text-white/40 shrink-0">Diễn viên:</span>
              <span className="font-medium text-white/90 leading-relaxed">
                {movie.actor.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. BÌNH LUẬN CỘNG ĐỒNG */}
      <div ref={commentsRef} className="pt-6 border-t border-white/10">
        <MovieComments movieSlug={movie.slug} movieName={movie.name} />
      </div>

      {/* 5. PHIM CÙNG THỂ LOẠI ĐỀ XUẤT */}
      {relatedMovies.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <MovieCarousel title="Phim Cùng Thể Loại Đề Xuất" movies={relatedMovies} />
        </div>
      )}

      {/* RATING MODAL POPUP */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-xl bg-[#15151a] border border-white/15 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Đánh giá phim</h3>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="p-1 rounded text-white/60 hover:text-white"
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
                  className="p-1 transition-transform hover:scale-125 cursor-pointer text-white"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || userRating || 0) >= star ? 'fill-current text-white' : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs text-white/50">
              {(hoverRating || userRating || 0) > 0 ? (
                <span className="text-white font-bold">
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
