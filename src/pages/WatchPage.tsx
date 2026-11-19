import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { phimApi, getPreferredServerIndex } from '../api/phimApi';
import { MovieDetail, EpisodeData, MovieItem } from '../types/movie';
import { ArtVideoPlayer } from '../components/player/ArtVideoPlayer';
import { EpisodeList } from '../components/player/EpisodeList';
import { storage } from '../utils/storage';
import { MovieCarousel } from '../components/common/MovieCarousel';
import { TrailerModal } from '../components/common/TrailerModal';
import { MovieComments } from '../components/movie/MovieComments';
import { Button } from '../components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
  Share2,
  Check,
  Star,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Film,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function resolveChannel(ep: EpisodeData, serverName: string): number {
  if (/embed/i.test(serverName)) return 1;
  if (ep.link_m3u8 && ep.link_m3u8.trim() !== '') return 0;
  if (ep.link_embed) return 1;
  return 0;
}

export const WatchPage: React.FC = () => {
  const { slug, episodeSlug } = useParams<{ slug: string; episodeSlug?: string }>();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | null>(null);
  const [currentChannel, setCurrentChannel] = useState(0); // 0 = HLS, 1 = Embed
  const [autoNext, setAutoNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'episodes' | 'comments' | 'related'>('episodes');
  const [relatedMovies, setRelatedMovies] = useState<MovieItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state with URL Hash (Chợ Phim standard)
  const syncHash = useCallback((epSlug: string, serverName: string, channel: number, serverId: number) => {
    const hash = `#tap=${epSlug}&sv=${encodeURIComponent(serverName)}&channel=${channel}&server_id=${serverId}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
    }
  }, []);

  // Parse Hash Parameters
  const parseHash = useCallback(() => {
    const raw = window.location.hash.replace(/^#/, '');
    if (!raw) return null;
    const params = new URLSearchParams(raw);
    return {
      tap: params.get('tap'),
      sv: params.get('sv'),
      channel: parseInt(params.get('channel') || '0', 10),
      serverId: parseInt(params.get('server_id') || '0', 10),
    };
  }, []);

  // Load movie data
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      try {
        const res = await phimApi.getMovieDetail(slug!);
        if (!isMounted) return;

        setMovie(res.movie);
        setIsBookmarked(storage.isBookmarked(res.movie.slug));

        // 1. Check URL Hash first
        const hashData = parseHash();

        // 2. Tự động ưu tiên server Tiếng Việt nếu chưa chọn server cụ thể
        let sIndex = getPreferredServerIndex(res.movie.episodes);

        if (hashData?.sv) {
          const foundS = res.movie.episodes.findIndex(
            (s) => s.server_name.toLowerCase() === hashData.sv?.toLowerCase()
          );
          if (foundS >= 0) {
            const hasHls = res.movie.episodes[foundS]?.server_data?.some(
              (e) => e.link_m3u8 && e.link_m3u8.trim() !== ''
            );
            if (hasHls) {
              sIndex = foundS;
            }
          }
        } else if (hashData?.serverId !== undefined && res.movie.episodes[hashData.serverId]) {
          const targetServer = res.movie.episodes[hashData.serverId];
          const hasHls = targetServer?.server_data?.some(
            (e) => e.link_m3u8 && e.link_m3u8.trim() !== ''
          );
          if (hasHls) {
            sIndex = hashData.serverId;
          }
        }
        setCurrentServerIndex(sIndex);

        const server = res.movie.episodes?.[sIndex] || res.movie.episodes?.[0];
        if (server && server.server_data.length > 0) {
          let ep = server.server_data[0];
          const targetSlug = hashData?.tap || episodeSlug;
          if (targetSlug) {
            const found = server.server_data.find((e) => e.slug === targetSlug);
            if (found) ep = found;
          }
          setCurrentEpisode(ep);

          const initialChannel = resolveChannel(ep, server.server_name);
          setCurrentChannel(initialChannel);

          document.title = `${res.movie.name} - ${ep.name} | 2 Phim`;

          // Sync initial URL hash
          syncHash(ep.slug, server.server_name, initialChannel, sIndex);

          // Save Watch History
          storage.saveHistory({
            slug: res.movie.slug,
            name: res.movie.name,
            origin_name: res.movie.origin_name,
            poster_url: res.movie.poster_url,
            thumb_url: res.movie.thumb_url,
            episodeName: ep.name,
            episodeSlug: ep.slug,
            serverName: server.server_name || 'VIP Server',
            currentTime: 0,
            duration: 0,
          });
        }

        // Fetch Related Movies
        const firstCategory = res.movie.category?.[0]?.slug;
        if (firstCategory) {
          const relRes = await phimApi.getMoviesByCategory(firstCategory, 1, 10);
          if (isMounted) {
            setRelatedMovies(relRes.items.filter((m) => m.slug !== slug));
          }
        }
      } catch (err) {
        console.error('WatchPage load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, episodeSlug, parseHash, syncHash]);

  // Handle select episode
  const handleSelectEpisode = (serverIndex: number, episode: EpisodeData) => {
    if (!movie) return;
    setCurrentServerIndex(serverIndex);
    setCurrentEpisode(episode);

    const sName = movie.episodes?.[serverIndex]?.server_name || '';
    const nextChannel = resolveChannel(episode, sName);
    setCurrentChannel(nextChannel);

    syncHash(episode.slug, sName, nextChannel, serverIndex);

    document.title = `${movie.name} - ${episode.name} | 2 Phim`;

    storage.saveHistory({
      slug: movie.slug,
      name: movie.name,
      origin_name: movie.origin_name,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      episodeName: episode.name,
      episodeSlug: episode.slug,
      serverName: sName || 'VIP Server',
      currentTime: 0,
      duration: 0,
    });
  };

  // Handle switch channel (HLS vs Embed)
  const handleChannelChange = (channel: number) => {
    setCurrentChannel(channel);
    if (movie && currentEpisode) {
      const sName = movie.episodes?.[currentServerIndex]?.server_name || '';
      syncHash(currentEpisode.slug, sName, channel, currentServerIndex);
    }
  };

  // Episode navigation helpers
  const getNextEpisode = () => {
    if (!movie || !currentEpisode) return null;
    const currentServer = movie.episodes[currentServerIndex];
    if (!currentServer) return null;
    const eps = currentServer.server_data;
    const idx = eps.findIndex((e) => e.slug === currentEpisode.slug);
    if (idx >= 0 && idx < eps.length - 1) {
      return eps[idx + 1];
    }
    return null;
  };

  const getPrevEpisode = () => {
    if (!movie || !currentEpisode) return null;
    const currentServer = movie.episodes[currentServerIndex];
    if (!currentServer) return null;
    const eps = currentServer.server_data;
    const idx = eps.findIndex((e) => e.slug === currentEpisode.slug);
    if (idx > 0) {
      return eps[idx - 1];
    }
    return null;
  };

  const handleNextEpisode = () => {
    const nextEp = getNextEpisode();
    if (nextEp && movie) {
      handleSelectEpisode(currentServerIndex, nextEp);
    }
  };

  const handlePrevEpisode = () => {
    const prevEp = getPrevEpisode();
    if (prevEp && movie) {
      handleSelectEpisode(currentServerIndex, prevEp);
    }
  };

  if (loading) {
    return (
      <div className="py-6 space-y-4 animate-pulse max-w-6xl mx-auto">
        <div className="w-full aspect-video bg-[#141418] rounded-3xl" />
        <div className="h-20 bg-[#141418] rounded-2xl" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-white mb-4">Không tìm thấy phim</p>
        <Link to="/" className="px-6 py-3 rounded-full bg-[#FECF59] text-black font-bold">
          Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const prevEp = getPrevEpisode();
  const nextEp = getNextEpisode();

  // Age rating calculation
  const ageRating = (() => {
    const s = movie.slug || '';
    if (s.includes('kinh-di') || s.includes('sat-nhan')) return 'T18';
    if (s.includes('hanh-dong') || s.includes('chien-tranh')) return 'T16';
    if (s.includes('hoat-hinh') || s.includes('anime')) return 'P';
    return 'T13';
  })();

  return (
    <>
      {/* Lights off backdrop overlay */}
      {isLightsOff && (
        <div
          className="fixed inset-0 bg-black/95 z-40 transition-opacity duration-300"
          onClick={() => setIsLightsOff(false)}
        />
      )}

      <div className={`space-y-6 relative z-40 pb-24 lg:pb-12 ${isTheaterMode ? 'max-w-none' : 'max-w-6xl mx-auto'}`}>
        {/* 1. ARTPLAYER VIDEO ENGINE */}
        <ArtVideoPlayer
          m3u8Url={currentEpisode?.link_m3u8}
          embedUrl={currentEpisode?.link_embed}
          poster={movie.poster_url || movie.thumb_url}
          movieName={movie.name}
          episodeName={currentEpisode?.name || 'Tập 1'}
          episodes={movie.episodes}
          currentServerIndex={currentServerIndex}
          currentEpisodeSlug={currentEpisode?.slug || ''}
          currentChannel={currentChannel}
          onSelectEpisode={handleSelectEpisode}
          onChannelChange={handleChannelChange}
          onNextEpisode={handleNextEpisode}
          onEnded={() => {
            if (autoNext) handleNextEpisode();
          }}
        />

        {/* 2. SPATIAL CINEMA ACTION & CONTROL TOOLBAR */}
        <div className="p-4 sm:p-6 rounded-3xl liquid-glass space-y-4 shadow-xl">
          {/* Top Row: Title + Next/Prev Episode */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-white/10 text-white border border-white/20">
                  {ageRating}
                </span>
                {movie.quality && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white border border-white/20">
                    {movie.quality}
                  </span>
                )}
                {movie.lang && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white border border-white/20">
                    {movie.lang}
                  </span>
                )}
                <span className="text-xs font-bold text-white/50">{movie.year || '2026'}</span>
                {movie.episode_current && (
                  <span className="text-xs font-bold text-white/80">
                    {movie.episode_current}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white uppercase mt-1">
                {movie.name} <span className="text-white/80 font-bold">– {currentEpisode?.name || 'Tập 1'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/50 font-medium">{movie.origin_name}</p>
            </div>

            {/* Prev / Next Episode Buttons */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={handlePrevEpisode}
                disabled={!prevEp}
                className="liquid-pill px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Tập Trước</span>
              </button>

              <button
                type="button"
                onClick={handleNextEpisode}
                disabled={!nextEp}
                className="liquid-cta-primary px-4 py-2 text-xs font-black flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span>Tập Kế Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Quick Action Tool Buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Trailer Button */}
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="px-3.5 py-1.5 rounded-full liquid-pill text-white/80 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-white/70" />
                <span>Trailer</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => {
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
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isBookmarked
                    ? 'liquid-cta-primary font-black shadow-md'
                    : 'liquid-pill text-white/80 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-black' : ''}`} />
                <span>{isBookmarked ? 'Đã Lưu' : 'Lưu Xem Sau'}</span>
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full liquid-pill text-white/80 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Chia sẻ"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Đã Sao Chép Link' : 'Chia Sẻ'}</span>
              </button>
            </div>

            {/* Viewing Experience Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLightsOff(!isLightsOff)}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isLightsOff
                    ? 'liquid-cta-primary shadow-md'
                    : 'liquid-pill text-white/70 hover:text-white'
                }`}
                title="Bật/Tắt đèn phòng chiếu"
              >
                {isLightsOff ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`p-2 rounded-full transition-all hidden sm:block cursor-pointer ${
                  isTheaterMode
                    ? 'liquid-cta-primary shadow-md'
                    : 'liquid-pill text-white/70 hover:text-white'
                }`}
                title="Chế độ Rạp Phim mở rộng"
              >
                {isTheaterMode ? <Minimize2 className="w-4 h-4 text-black" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <Link
                to={`/phim/${movie.slug}`}
                className="px-3.5 py-1.5 rounded-full liquid-pill text-white/80 hover:text-white text-xs font-bold flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5 text-white/70" />
                <span>Chi Tiết</span>
              </Link>
            </div>
          </div>

          {/* Expandable Synopsis / Movie Story */}
          {movie.content && (
            <div className="pt-3 border-t border-white/10">
              <div
                className={`text-xs sm:text-sm text-white/75 leading-relaxed transition-all ${
                  isContentExpanded ? '' : 'line-clamp-2'
                }`}
                dangerouslySetInnerHTML={{
                  __html: movie.content.replace(/<[^>]+>/g, ''),
                }}
              />
              <button
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="text-[11px] font-bold text-white/80 hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
              >
                <span>{isContentExpanded ? 'Thu gọn' : 'Xem thêm cốt truyện'}</span>
                {isContentExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* 3. TAB CONTROLLER: EPISODES | COMMENTS & REVIEWS | RELATED MOVIES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1.5 rounded-full liquid-glass max-w-md">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'episodes'
                  ? 'liquid-cta-primary shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Danh Sách Tập</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'comments'
                  ? 'liquid-cta-primary shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bình Luận</span>
            </button>

            <button
              onClick={() => setActiveTab('related')}
              className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'related'
                  ? 'liquid-cta-primary shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Đề Xuất</span>
            </button>
          </div>

          {/* TAB 1: EPISODES */}
          {activeTab === 'episodes' && (
            <EpisodeList
              episodes={movie.episodes}
              currentServerIndex={currentServerIndex}
              currentEpisodeSlug={currentEpisode?.slug || ''}
              autoNext={autoNext}
              onToggleAutoNext={() => setAutoNext(!autoNext)}
              onSelectEpisode={handleSelectEpisode}
            />
          )}

          {/* TAB 2: COMMENTS & COMMUNITY REVIEWS */}
          {activeTab === 'comments' && (
            <MovieComments movieSlug={movie.slug} movieName={movie.name} />
          )}

          {/* TAB 3: RELATED MOVIES */}
          {activeTab === 'related' && relatedMovies.length > 0 && (
            <MovieCarousel title="Phim Cùng Thể Loại Đề Xuất" movies={relatedMovies} />
          )}
        </div>
      </div>

      {/* Trailer Modal Dialog */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movieName={movie.name}
        trailerUrl={(movie as any).trailer_url}
      />
    </>
  );
};
