import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Tv,
  Play,
  RotateCcw,
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

  // WeTV Episode Range Switcher state (e.g. 1-30, 31-60)
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const CHUNK_SIZE = 30; // WeTV standard: 30 episodes per range

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

  // Episode range calculation (WeTV pattern)
  const totalRanges = Math.ceil(allEpisodes.length / CHUNK_SIZE);
  const currentChunkEpisodes = useMemo(() => {
    return allEpisodes.slice(
      selectedRangeIndex * CHUNK_SIZE,
      (selectedRangeIndex + 1) * CHUNK_SIZE
    );
  }, [allEpisodes, selectedRangeIndex]);

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
      // Auto switch range if next episode is in next chunk
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
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 aspect-video bg-white/5 rounded-xl" />
          <div className="w-full lg:w-[360px] h-[480px] bg-white/5 rounded-xl" />
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

      <div className={`space-y-8 relative z-40 pb-20 select-none ${isTheaterMode ? 'max-w-none px-2 sm:px-4' : 'max-w-[1560px] mx-auto px-3 sm:px-6'}`}>
        {/* 1. TOP MAIN ROW (WeTV Standard: Left Video Player + Right Episode Sidebar) */}
        <div className={`flex flex-col ${isTheaterMode ? 'space-y-6' : 'lg:flex-row lg:items-start lg:gap-5'}`}>
          {/* CỘT TRÁI: VIDEO PLAYER & METADATA THÔNG TIN */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Player Container */}
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

            {/* SEAMLESS INFO & ACTION TOOLBAR (Liền mạch, không hộp cồng kềnh) */}
            <div className="space-y-3.5 pt-1">
              {/* Title & Next/Prev Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    <Link to={`/phim/${movie.slug}`} className="hover:underline">
                      {movie.name}
                    </Link>{' '}
                    <span className="text-white/80 font-bold">– {currentEpisode?.name || 'Tập 1'}</span>
                  </h1>
                  {movie.origin_name && (
                    <p className="text-xs sm:text-sm text-white/50 font-medium mt-0.5">
                      {movie.origin_name}
                    </p>
                  )}
                </div>

                {/* Prev / Next Episode Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevEpisode}
                    disabled={!prevEp}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Tập Trước</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextEpisode}
                    disabled={!nextEp}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-white/90 flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
                  >
                    <span>Tập Kế Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metadata Badges & Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10 text-xs">
                {/* Left: Tags */}
                <div className="flex items-center gap-2 flex-wrap text-white/75">
                  <span className="px-2 py-0.5 rounded font-bold bg-white/10 text-white border border-white/15">
                    {ageRating}
                  </span>
                  {movie.year && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {movie.year}
                    </span>
                  )}
                  {movie.quality && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {movie.quality}
                    </span>
                  )}
                  {movie.lang && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {movie.lang}
                    </span>
                  )}
                  {movie.country?.[0] && (
                    <span className="text-white/50">
                      {movie.country[0].name}
                    </span>
                  )}
                  {movie.category && movie.category.length > 0 && (
                    <span className="text-white/40">
                      · {movie.category.map((c) => c.name).join(' · ')}
                    </span>
                  )}
                </div>

                {/* Right: Actions (Theo dõi, Trailer, Báo lỗi, Rạp chiếu, Tắt đèn, Chia sẻ) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white/90 border-white/10'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-black' : ''}`} />
                    <span>{isBookmarked ? 'Đã Lưu' : 'Lưu Xem Sau'}</span>
                  </button>

                  {movie.trailer_url && (
                    <button
                      type="button"
                      onClick={() => setIsTrailerOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-white/70" />
                      <span>Trailer</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleReport}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {reportSent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Đã Báo Lỗi</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-white/60" />
                        <span>Báo Lỗi</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hidden sm:flex items-center justify-center cursor-pointer transition-colors"
                    title={isTheaterMode ? 'Thu nhỏ chế độ rạp' : 'Chế độ rạp chiếu (Toàn cảnh)'}
                  >
                    {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLightsOff(!isLightsOff)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
                    title="Bật/Tắt đèn phòng chiếu"
                  >
                    {isLightsOff ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
                    title="Chia sẻ phim"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Schedule Notice (WeTV style inline hint) */}
              <div className="text-xs text-white/60 flex items-center gap-2 pt-1">
                <Calendar className="w-3.5 h-3.5 text-white/50 shrink-0" />
                <span>
                  {movie.type === 'series' || movie.type === 'hoathinh'
                    ? 'Lịch phát sóng: Cập nhật tập mới đều đặn hàng tuần • Bản Vietsub & Thuyết minh Full HD.'
                    : 'Bản Đẹp Vietsub & Thuyết Minh Chuẩn Điện Ảnh.'}
                </span>
              </div>

              {/* Synopsis Section */}
              {movie.content && (
                <div className="pt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                  <div
                    className={isContentExpanded ? '' : 'line-clamp-2'}
                    dangerouslySetInnerHTML={{
                      __html: movie.content.replace(/<[^>]+>/g, ''),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <span>{isContentExpanded ? 'Thu gọn' : 'Xem thêm cốt truyện'}</span>
                    {isContentExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: PLAYLIST DANH SÁCH TẬP (WeTV Standard Playlist Sidebar) */}
          <div className={`w-full ${isTheaterMode ? 'pt-4' : 'lg:w-[350px] xl:w-[380px] shrink-0'} space-y-3`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Danh Sách Tập
                </h2>
                <span className="text-xs text-white/40 font-medium">
                  ({allEpisodes.length} tập)
                </span>
              </div>

              {/* Auto next toggle */}
              <label className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNext}
                  onChange={(e) => setAutoNext(e.target.checked)}
                  className="rounded accent-white cursor-pointer"
                />
                <span>Tự chuyển tập</span>
              </label>
            </div>

            {/* Server Tabs (if multiple servers exist) */}
            {movie.episodes.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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

            {/* Episode Range Switcher (WeTV Signature: 01-30, 31-60...) */}
            {totalRanges > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-white/10">
                <Layers className="w-3.5 h-3.5 text-white/50 shrink-0" />
                {Array.from({ length: totalRanges }).map((_, rIdx) => {
                  const start = rIdx * CHUNK_SIZE + 1;
                  const end = Math.min((rIdx + 1) * CHUNK_SIZE, allEpisodes.length);
                  const isCurrentRange = selectedRangeIndex === rIdx;
                  return (
                    <button
                      key={rIdx}
                      type="button"
                      onClick={() => setSelectedRangeIndex(rIdx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                        isCurrentRange
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                      }`}
                    >
                      {start} - {end}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5-Column Episode Grid (WeTV 5-col rectangular tiles) */}
            {currentChunkEpisodes.length > 0 ? (
              <div className={`grid grid-cols-5 gap-1.5 overflow-y-auto pr-1 ${isTheaterMode ? 'max-h-72' : 'max-h-[500px] lg:max-h-[560px]'}`}>
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
                      {isCurrent && <Play className="w-2.5 h-2.5 fill-current mr-1 shrink-0" />}
                      <span className="truncate">{ep.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/40">
                Đang cập nhật tập phim...
              </div>
            )}
          </div>
        </div>

        {/* 2. BOTTOM SECTION: BÌNH LUẬN & THẢO LUẬN */}
        <div className="pt-8 border-t border-white/10">
          <MovieComments movieSlug={movie.slug} movieName={movie.name} />
        </div>

        {/* 3. ĐỀ XUẤT PHIM LIÊN QUAN */}
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
