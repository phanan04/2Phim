import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { phimApi } from '../api/phimApi';
import { MovieDetail, MovieItem } from '../types/movie';
import { getImageUrl } from '../utils/image';
import { storage } from '../utils/storage';
import { RatingBadge } from '../components/common/RatingBadge';
import { MovieCarousel } from '../components/common/MovieCarousel';
import { MovieComments } from '../components/movie/MovieComments';
import { TrailerModal } from '../components/common/TrailerModal';
import { Button } from '../components/ui/button';
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
  Crown,
} from 'lucide-react';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);

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

  if (loading) {
    return (
      <div className="py-12 space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-96 bg-[#18181C] rounded-3xl" />
        <div className="h-40 bg-[#18181C] rounded-2xl" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy phim</h2>
        <Link to="/" className="px-6 py-3 rounded-full bg-[#FECF59] text-black font-bold">
          Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const backdropUrl = getImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  const firstServer = movie.episodes?.[0];
  const firstEpisode = firstServer?.server_data?.[0];
  const watchUrl = firstEpisode
    ? `/xem/${movie.slug}/${firstEpisode.slug}#tap=${firstEpisode.slug}&sv=${encodeURIComponent(firstServer?.server_name || '')}&channel=0&server_id=0`
    : `/xem/${movie.slug}`;

  // Age rating calculation
  const ageRating = (() => {
    const s = movie.slug || '';
    if (s.includes('kinh-di') || s.includes('sat-nhan')) return 'T18';
    if (s.includes('hanh-dong') || s.includes('chien-tranh')) return 'T16';
    if (s.includes('hoat-hinh') || s.includes('anime')) return 'P';
    return 'T13';
  })();

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Hero Backdrop Banner */}
      <div className="relative rounded-3xl overflow-hidden liquid-glass shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={movie.name}
            className="w-full h-full object-cover object-center filter blur-xl opacity-35 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/85 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Column */}
          <div className="w-56 sm:w-64 md:w-72 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden artwork-poster-card group relative">
            <img
              src={posterUrl}
              alt={movie.name}
              className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {movie.episode_current && (
              <span className="absolute top-3 left-3 px-2.5 py-0.5 text-xs font-black uppercase rounded-full bg-white text-[#070709] shadow-md tracking-wider">
                {movie.episode_current}
              </span>
            )}
            <Link
              to={watchUrl}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <div className="w-14 h-14 rounded-full liquid-cta-primary flex items-center justify-center shadow-2xl">
                <Play className="w-6 h-6 fill-current ml-0.5 text-black" />
              </div>
            </Link>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/10 backdrop-blur-md text-white border border-white/20">
                  {ageRating}
                </span>

                <RatingBadge imdb={movie.imdb} tmdb={movie.tmdb} size="md" />

                {movie.quality && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white/90 border border-white/15">
                    {movie.quality}
                  </span>
                )}
                {movie.lang && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-white/90 border border-white/15">
                    {movie.lang}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight uppercase tracking-tight">
                {movie.name}
              </h1>
              <p className="text-base sm:text-lg text-white/70 font-semibold mt-1">
                {movie.origin_name}
              </p>
            </div>

            {/* Quick Meta List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-white/70 py-3 border-y border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/80" />
                <span>Năm: <strong className="text-white">{movie.year}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/80" />
                <span>Thời lượng: <strong className="text-white">{movie.time || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-white/80" />
                <span>Trạng thái: <strong className="text-white">{movie.episode_current || 'Full'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white/80" />
                <span>
                  Quốc gia:{' '}
                  {movie.country?.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/quoc-gia/${c.slug}`}
                      className="text-white hover:underline ml-1"
                    >
                      {c.name}
                    </Link>
                  ))}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-white/80" />
                <span className="flex flex-wrap gap-1.5">
                  Thể loại:{' '}
                  {movie.category?.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/the-loai/${cat.slug}`}
                      className="px-2.5 py-0.5 rounded-full liquid-pill text-white/90 hover:text-white transition-colors text-xs"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <Link
                to={watchUrl}
                className="px-8 py-3.5 rounded-full liquid-cta-primary font-black text-sm flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-current text-black" />
                <span>XEM PHIM NGAY</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="px-6 py-3.5 rounded-full liquid-pill text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4 text-white/90" />
                <span>XEM TRAILER</span>
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`px-5 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isBookmarked
                    ? 'liquid-cta-primary font-black'
                    : 'liquid-pill text-white/90 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current text-black' : ''}`} />
                <span>{isBookmarked ? 'Đã Lưu' : 'Xem Sau'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-full liquid-pill text-white/80 hover:text-white cursor-pointer"
                title="Chia sẻ"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content & Episodes */}
      <div className="space-y-8">
        {/* Tóm tắt nội dung */}
        <div className="p-6 sm:p-8 rounded-3xl liquid-card space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-white/80" /> Nội Dung Phim
          </h3>
          <div
            className="text-sm sm:text-base text-white/80 leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{
              __html: movie.content || 'Đang cập nhật nội dung...',
            }}
          />
        </div>

        {/* Danh sách tập */}
        {movie.episodes && movie.episodes.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl liquid-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-white/80" /> Danh Sách Tập
              </h3>
              <span className="text-xs text-white/70 font-semibold px-2.5 py-1 rounded-full liquid-pill">
                {movie.episodes[0]?.server_data?.length || 0} tập sẵn sàng
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {movie.episodes[0]?.server_data?.map((ep) => (
                <Link
                  key={ep.slug}
                  to={`/xem/${movie.slug}/${ep.slug}#tap=${ep.slug}&sv=${encodeURIComponent(movie.episodes[0]?.server_name || '')}&channel=0&server_id=0`}
                  className="py-2.5 px-2 text-center rounded-xl liquid-pill hover:bg-white hover:text-black font-bold text-xs sm:text-sm text-white/90 transition-all truncate"
                >
                  {ep.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Đánh Giá & Bình Luận Cộng Đồng */}
        <MovieComments movieSlug={movie.slug} movieName={movie.name} />

        {/* Phim liên quan */}
        {relatedMovies.length > 0 && (
          <MovieCarousel
            title="Đề Xuất Cho Bạn"
            movies={relatedMovies}
          />
        )}
      </div>

      {/* Trailer Modal Dialog */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movieName={movie.name}
        trailerUrl={movie.trailer_url || undefined}
      />
    </div>
  );
};
