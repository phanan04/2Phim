import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { phimApi, getPreferredServerIndex } from '../api/phimApi';
import { MovieDetail, EpisodeData, MovieItem } from '../types/movie';
import { ArtVideoPlayer } from '../components/player/ArtVideoPlayer';
import { storage } from '../utils/storage';
import { MovieCarousel } from '../components/common/MovieCarousel';
import { TrailerModal } from '../components/common/TrailerModal';
import { MovieComments } from '../components/movie/MovieComments';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Check,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Film,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Tv,
  Play,
  Info,
  Star,
  SkipBack,
  SkipForward,
  MoreHorizontal,
  MessageSquare,
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
  const [relatedMovies, setRelatedMovies] = useState<MovieItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // WeTV Episode Range Switcher state (e.g. 1-40, 41-80)
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const CHUNK_SIZE = 40; // 8 rows of 5 to fill the player height nicely

  const rangeListRef = useRef<HTMLDivElement>(null);

  // Sync state with URL Hash
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

        // 2. Select preferred server
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

          // Find which range the episode belongs to
          const epIdx = server.server_data.findIndex((e) => e.slug === ep.slug);
          if (epIdx >= 0) {
            setSelectedRangeIndex(Math.floor(epIdx / CHUNK_SIZE));
          }

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
          const relRes = await phimApi.getMoviesByCategory(firstCategory, 1, 12);
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

  const handleChannelChange = (channel: number) => {
    setCurrentChannel(channel);
    if (movie && currentEpisode) {
      const sName = movie.episodes?.[currentServerIndex]?.server_name || '';
      syncHash(currentEpisode.slug, sName, channel, currentServerIndex);
    }
  };

  const currentServer = movie?.episodes?.[currentServerIndex] || movie?.episodes?.[0];
  const allEpisodes = currentServer?.server_data || [];

  // Cast & crew list for WeTV style avatars
  const castAndCrew = useMemo(() => {
    if (!movie) return [];
    const list: { name: string; role: string }[] = [];
    if (movie.director && movie.director.length > 0) {
      movie.director.forEach((d) => {
        if (d && d.trim()) list.push({ name: d.trim(), role: 'Đạo diễn' });
      });
    }
    if (movie.actor && movie.actor.length > 0) {
      movie.actor.forEach((a) => {
        if (a && a.trim() && !list.some((item) => item.name === a.trim())) {
          list.push({ name: a.trim(), role: 'Diễn viên' });
        }
      });
    }
    return list;
  }, [movie]);

  // Episode range calculation
  const totalRanges = Math.ceil(allEpisodes.length / CHUNK_SIZE);
  const currentChunkEpisodes = useMemo(() => {
    return allEpisodes.slice(
      selectedRangeIndex * CHUNK_SIZE,
      (selectedRangeIndex + 1) * CHUNK_SIZE
    );
  }, [allEpisodes, selectedRangeIndex]);

  // Scroll range buttons horizontally
  const scrollRange = (direction: 'left' | 'right') => {
    if (rangeListRef.current) {
      const delta = direction === 'left' ? -140 : 140;
      rangeListRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const onWheelRange = (e: React.WheelEvent) => {
    if (rangeListRef.current) {
      rangeListRef.current.scrollLeft += e.deltaY;
    }
  };

  // Scroll active range pill into view
  useEffect(() => {
    if (rangeListRef.current) {
      const activeEl = rangeListRef.current.querySelector(
        `[data-range-idx="${selectedRangeIndex}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedRangeIndex]);

  // Episode navigation helpers
  const getNextEpisode = () => {
    if (!allEpisodes.length || !currentEpisode) return null;
    const idx = allEpisodes.findIndex((e) => e.slug === currentEpisode.slug);
    if (idx >= 0 && idx < allEpisodes.length - 1) {
      return allEpisodes[idx + 1];
    }
    return null;
  };

  const getPrevEpisode = () => {
    if (!allEpisodes.length || !currentEpisode) return null;
    const idx = allEpisodes.findIndex((e) => e.slug === currentEpisode.slug);
    if (idx > 0) {
      return allEpisodes[idx - 1];
    }
    return null;
  };

  const handleNextEpisode = () => {
    const nextEp = getNextEpisode();
    if (nextEp && movie) {
      handleSelectEpisode(currentServerIndex, nextEp);
      const nextIdx = allEpisodes.findIndex((e) => e.slug === nextEp.slug);
      if (nextIdx >= 0) {
        setSelectedRangeIndex(Math.floor(nextIdx / CHUNK_SIZE));
      }
    }
  };

  const handlePrevEpisode = () => {
    const prevEp = getPrevEpisode();
    if (prevEp && movie) {
      handleSelectEpisode(currentServerIndex, prevEp);
      const prevIdx = allEpisodes.findIndex((e) => e.slug === prevEp.slug);
      if (prevIdx >= 0) {
        setSelectedRangeIndex(Math.floor(prevIdx / CHUNK_SIZE));
      }
    }
  };

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

  const handleReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-6 space-y-4 animate-pulse max-w-[1560px] mx-auto px-4">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-5 items-stretch">
          <div className="w-full aspect-video bg-white/5 rounded-xl" />
          <div className="w-full h-full min-h-[460px] bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-xl text-white font-bold">Không tìm thấy phim yêu cầu</p>
        <Link to="/" className="inline-flex px-6 py-2.5 rounded-lg bg-white text-black font-bold text-xs">
          Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const prevEp = getPrevEpisode();
  const nextEp = getNextEpisode();

  const ageRating = (() => {
    const s = movie.slug || '';
    if (s.includes('kinh-di') || s.includes('sat-nhan')) return 'T18';
    if (s.includes('hanh-dong') || s.includes('chien-tranh')) return 'T16';
    if (s.includes('hoat-hinh') || s.includes('anime')) return 'P';
    return 'T13';
  })();

  return (
    <>
      {/* Lights Off Backdrop Overlay */}
      {isLightsOff && (
        <div
          className="fixed inset-0 bg-black/95 z-40 transition-opacity duration-300"
          onClick={() => setIsLightsOff(false)}
        />
      )}

      <div className={`space-y-6 relative z-40 pb-20 select-none ${isTheaterMode ? 'max-w-none px-2 sm:px-4' : 'max-w-[1560px] mx-auto px-3 sm:px-6'}`}>
        {/* 1. TOP ROW: VIDEO PLAYER (LEFT) + PLAYLIST SIDEBAR (RIGHT) */}
        {/* Uses items-stretch and flex-1 so the right sidebar matches the exact height of the video player */}
        <div className={isTheaterMode ? 'space-y-4' : 'flex flex-col lg:grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-4 xl:gap-5 items-stretch'}>
          {/* CỘT TRÁI: VIDEO PLAYER & THANH ĐIỀU KHIỂN DƯỚI VIDEO (MATCHING ẢNH 3) */}
          <div className="flex flex-col min-w-0">
            <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
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
            </div>

            {/* THANH ĐIỀU KHIỂN DƯỚI VIDEO (MATCHING ẢNH 3 CỦA NGƯỜI DÙNG) */}
            <div className="flex flex-wrap items-center justify-between gap-y-2.5 py-2.5 px-2 mt-1 border-b border-white/10 text-white/70 select-none">
              {/* Các nút điều khiển chính có icon & chữ bên dưới (Ảnh 3) */}
              <div className="flex items-center gap-3.5 sm:gap-5">
                {/* 1. Theo dõi */}
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`flex flex-col items-center gap-1 group cursor-pointer transition-colors ${
                    isBookmarked ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Đã lưu vào danh sách' : 'Lưu xem sau'}
                >
                  <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${isBookmarked ? 'fill-current text-white' : ''}`} />
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Theo dõi</span>
                </button>

                {/* 2. Đánh giá */}
                <button
                  type="button"
                  onClick={() => {
                    setShowComments(true);
                    setTimeout(() => {
                      document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white transition-colors"
                  title="Xem đánh giá & bình luận"
                >
                  <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Đánh giá</span>
                </button>

                {/* Divider */}
                <div className="w-[1px] h-5 bg-white/10 hidden xs:block" />

                {/* 3. Trước (Tập trước) */}
                <button
                  type="button"
                  onClick={handlePrevEpisode}
                  disabled={!prevEp}
                  className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Tập trước"
                >
                  <SkipBack className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Trước</span>
                </button>

                {/* 4. Tiếp (Tập tiếp theo) */}
                <button
                  type="button"
                  onClick={handleNextEpisode}
                  disabled={!nextEp}
                  className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Tập tiếp theo"
                >
                  <SkipForward className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Tiếp</span>
                </button>

                {/* Divider */}
                <div className="w-[1px] h-5 bg-white/10 hidden sm:block" />

                {/* 5. Đèn (Bật / Tắt đèn) */}
                <button
                  type="button"
                  onClick={() => setIsLightsOff(!isLightsOff)}
                  className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white transition-colors"
                  title="Bật/Tắt đèn phòng chiếu"
                >
                  {isLightsOff ? (
                    <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white transition-transform group-hover:scale-110" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                  )}
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Đèn</span>
                </button>

                {/* 6. Rạp phim (Chế độ rạp chiếu) */}
                <button
                  type="button"
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className={`flex flex-col items-center gap-1 group cursor-pointer transition-colors ${
                    isTheaterMode ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Chế độ rạp chiếu toàn cảnh"
                >
                  {isTheaterMode ? (
                    <Minimize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                  ) : (
                    <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                  )}
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Rạp phim</span>
                </button>

                {/* 7. Khác (More: Báo lỗi, Trailer, Chia sẻ) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white transition-colors"
                    title="Tuỳ chọn khác"
                  >
                    <MoreHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">Khác</span>
                  </button>

                  {showMoreActions && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 rounded-xl bg-[#141419]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {movie.trailer_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsTrailerOpen(true);
                            setShowMoreActions(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>Xem Trailer</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleReport();
                          setShowMoreActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-white/60" />
                        <span>{reportSent ? 'Đã báo lỗi' : 'Báo lỗi phim'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleShare();
                          setShowMoreActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Đã sao chép' : 'Chia sẻ phim'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Đổi Server: VIP 1, VIP 2... (như ảnh 3 của người dùng) */}
              {movie.episodes.length > 0 && (
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <span className="text-white/40 hidden sm:inline font-medium">Đổi Server:</span>
                  <div className="flex items-center gap-1.5">
                    {movie.episodes.map((s, idx) => (
                      <button
                        key={`${s.server_name}-${idx}`}
                        type="button"
                        onClick={() => handleSelectEpisode(idx, s.server_data[0] || currentEpisode)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          currentServerIndex === idx
                            ? 'bg-white text-black shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
                        }`}
                      >
                        VIP {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: PLAYLIST SIDEBAR (CÂN ĐỐI & KHỚP CHIỀU CAO VỚI VIDEO) */}
          <div className={`w-full flex flex-col h-full bg-[#0d0d11]/90 border border-white/10 rounded-xl p-3 sm:p-4 min-h-[380px] lg:min-h-0 ${isTheaterMode ? 'mt-4' : ''}`}>
            {/* Header: Title & Auto-Next Toggle */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Danh Sách Tập
                </h2>
                <span className="text-xs text-white/40 font-medium">
                  ({allEpisodes.length} tập)
                </span>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoNext}
                  onChange={(e) => setAutoNext(e.target.checked)}
                  className="rounded accent-white cursor-pointer w-3.5 h-3.5"
                />
                <span>Tự chuyển tập</span>
              </label>
            </div>

            {/* Server Tabs (if multiple servers exist) */}
            {movie.episodes.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 shrink-0 border-b border-white/5">
                {movie.episodes.map((s, idx) => (
                  <button
                    key={`${s.server_name}-${idx}`}
                    type="button"
                    onClick={() => handleSelectEpisode(idx, s.server_data[0] || currentEpisode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                      currentServerIndex === idx
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                    }`}
                  >
                    <Tv className="w-3 h-3" />
                    <span>{s.server_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* WeTV Range Switcher (Có nút bấm cuộn trái/phải và hỗ trợ kéo chuột) */}
            {totalRanges > 1 && (
              <div className="flex items-center gap-1 py-2 shrink-0 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => scrollRange('left')}
                  className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white text-white/60 hover:text-black border border-white/10 transition-colors shrink-0 cursor-pointer"
                  title="Cuộn sang trái"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div
                  ref={rangeListRef}
                  onWheel={onWheelRange}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
                >
                  {Array.from({ length: totalRanges }).map((_, rIdx) => {
                    const start = rIdx * CHUNK_SIZE + 1;
                    const end = Math.min((rIdx + 1) * CHUNK_SIZE, allEpisodes.length);
                    const isCurrentRange = selectedRangeIndex === rIdx;
                    return (
                      <button
                        key={rIdx}
                        data-range-idx={rIdx}
                        type="button"
                        onClick={() => setSelectedRangeIndex(rIdx)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                          isCurrentRange
                            ? 'bg-white text-black font-bold shadow-sm'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {start} - {end}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollRange('right')}
                  className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white text-white/60 hover:text-black border border-white/10 transition-colors shrink-0 cursor-pointer"
                  title="Cuộn sang phải"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Episode Grid (Fills remaining vertical height naturally) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-2.5">
              {currentChunkEpisodes.length > 0 ? (
                <div className="grid grid-cols-5 gap-1.5 pb-2">
                  {currentChunkEpisodes.map((ep) => {
                    const isCurrent = currentEpisode?.slug === ep.slug;
                    return (
                      <button
                        key={ep.slug}
                        type="button"
                        onClick={() => handleSelectEpisode(currentServerIndex, ep)}
                        className={`h-10 rounded-md text-xs font-semibold flex items-center justify-center transition-colors truncate px-1 cursor-pointer border ${
                          isCurrent
                            ? 'bg-white text-black font-black border-white shadow-sm'
                            : 'bg-white/5 hover:bg-white text-white/80 hover:text-black border-white/10'
                        }`}
                        title={ep.name}
                      >
                        {isCurrent && <Play className="w-2.5 h-2.5 fill-current mr-0.5 shrink-0" />}
                        <span className="truncate">{ep.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-white/40">
                  Đang cập nhật danh sách tập...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. THÔNG TIN PHIM CHUẨN WETV (NGẮN GỌN, KHÔNG ĐÓNG KHUNG NHƯ ẢNH 2) */}
        <div className="space-y-2.5 pt-1">
          {/* Dòng 1: Tiêu đề phim + Tập xx + Nút Chia sẻ */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {movie.name}
            </h1>
            <span className="text-base sm:text-lg text-white/50 font-medium">
              {currentEpisode?.name || 'Tập 01'}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer ml-auto sm:ml-2"
              title="Chia sẻ phim"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
          </div>

          {/* Dòng 2: Tags metadata cách nhau bằng dấu gạch đứng | (Ảnh 2 WeTV) */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-white/60">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white border border-white/15">
              {ageRating}
            </span>
            {movie.year && (
              <>
                <span className="text-white/20">|</span>
                <span>{movie.year}</span>
              </>
            )}
            {movie.country?.[0] && (
              <>
                <span className="text-white/20">|</span>
                <span>{movie.country[0].name}</span>
              </>
            )}
            <span className="text-white/20">|</span>
            <span>Trọn bộ {allEpisodes.length || movie.episode_total || '??'} tập</span>
            {movie.category && movie.category.length > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-white/80">
                  {movie.category.map((c) => c.name).join(' · ')}
                </span>
              </>
            )}
          </div>

          {/* Dòng 3: Avatar tròn Đạo diễn & Diễn viên (Chuẩn WeTV Ảnh 2) */}
          {castAndCrew.length > 0 && (
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
              {castAndCrew.slice(0, 10).map((person, pIdx) => (
                <div key={pIdx} className="flex flex-col items-center gap-1.5 shrink-0 w-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/15 flex items-center justify-center text-white/90 font-bold text-sm shadow-md">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white font-medium truncate w-full" title={person.name}>
                    {person.name}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {person.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Dòng 4: Cốt truyện tóm tắt + Đọc thêm / Thu gọn (Chuẩn WeTV Ảnh 2) */}
          {movie.content && (
            <div className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-4xl">
              <p className={isContentExpanded ? '' : 'line-clamp-2'}>
                {movie.content.replace(/<[^>]+>/g, '')}
              </p>
              <button
                type="button"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="text-xs font-semibold text-white/50 hover:text-white inline-flex items-center gap-1 mt-1 cursor-pointer transition-colors"
              >
                <span>{isContentExpanded ? 'Thu gọn' : 'Đọc thêm'}</span>
                {isContentExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* 3. BÌNH LUẬN & ĐÁNH GIÁ (CHỈ HIỆN KHI BẤM XEM BÌNH LUẬN - REQUEST 5) */}
        <div id="comments-section" className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Bình Luận & Đánh Giá
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white text-white/80 hover:text-black border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{showComments ? 'Thu gọn bình luận' : 'Xem bình luận'}</span>
              {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showComments ? (
            <div className="pt-2 animate-in fade-in duration-300">
              <MovieComments movieSlug={movie.slug} movieName={movie.name} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="w-full py-4 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 flex items-center justify-between cursor-pointer transition-colors text-left group"
            >
              <div className="flex items-center gap-3 text-white/50 group-hover:text-white/80 transition-colors">
                <Star className="w-4 h-4 text-white/40" />
                <span className="text-xs">
                  Nhấn vào đây để xem nhận xét và đánh giá của khán giả về bộ phim...
                </span>
              </div>
              <span className="text-xs text-white/60 group-hover:text-white font-medium flex items-center gap-1">
                <span>Xem ngay</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </button>
          )}
        </div>

        {/* 4. ĐỀ XUẤT PHIM LIÊN QUAN */}
        {relatedMovies.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <MovieCarousel title="Phim Cùng Thể Loại Đề Xuất" movies={relatedMovies} />
          </div>
        )}
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
