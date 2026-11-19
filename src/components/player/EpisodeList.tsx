import React, { useState } from 'react';
import { Play, Server, Layers, AlertTriangle, CheckCircle2, Sparkles, Radio } from 'lucide-react';
import { EpisodeData, EpisodeServer } from '../../types/movie';

interface EpisodeListProps {
  episodes: EpisodeServer[];
  currentServerIndex: number;
  currentEpisodeSlug: string;
  autoNext?: boolean;
  onToggleAutoNext?: () => void;
  onSelectEpisode: (serverIndex: number, episode: EpisodeData) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  currentServerIndex,
  currentEpisodeSlug,
  autoNext = true,
  onToggleAutoNext,
  onSelectEpisode,
}) => {
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [reportSent, setReportSent] = useState(false);

  if (!episodes || episodes.length === 0) {
    return (
      <div className="p-6 rounded-3xl liquid-card text-center text-white/50 text-sm">
        Đang cập nhật danh sách tập phim...
      </div>
    );
  }

  const currentServer = episodes[currentServerIndex] || episodes[0];
  const episodeDataList = currentServer.server_data || [];

  const CHUNK_SIZE = 50;
  const totalGroups = Math.ceil(episodeDataList.length / CHUNK_SIZE);
  const currentChunk = episodeDataList.slice(
    selectedGroup * CHUNK_SIZE,
    (selectedGroup + 1) * CHUNK_SIZE
  );

  const handleReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  return (
    <div className="rounded-3xl liquid-card p-4 sm:p-6 space-y-4 shadow-xl select-none">
      {/* Server Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Server className="w-4 h-4 text-white/80" />
          <span>Nguồn Phát:</span>
          <span className="text-xs text-white/40 font-normal">({episodes.length} server)</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {episodes.map((server, idx) => {
            const isActive = idx === currentServerIndex;
            const isVietnamese = /thuyết\s*minh|lồng\s*tiếng/i.test(server.server_name);
            return (
              <button
                key={`${server.server_name}-${idx}`}
                onClick={() => onSelectEpisode(idx, server.server_data[0])}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'liquid-cta-primary shadow-md'
                    : 'liquid-pill text-white/70 hover:text-white'
                }`}
              >
                {isVietnamese ? (
                  <Sparkles className="w-3.5 h-3.5 fill-current text-white/90 shrink-0" />
                ) : (
                  <Radio className="w-3 h-3 text-white/50 shrink-0" />
                )}
                <span>{server.server_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pagination & Auto-next */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        {totalGroups > 1 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <Layers className="w-3.5 h-3.5 text-white/80 shrink-0" />
            <span className="text-white/50 shrink-0 mr-1">Tập:</span>
            {Array.from({ length: totalGroups }).map((_, groupIdx) => {
              const start = groupIdx * CHUNK_SIZE + 1;
              const end = Math.min((groupIdx + 1) * CHUNK_SIZE, episodeDataList.length);
              const isCurrentGroup = selectedGroup === groupIdx;
              return (
                <button
                  key={groupIdx}
                  onClick={() => setSelectedGroup(groupIdx)}
                  className={`px-3 py-1 rounded-full shrink-0 font-bold transition-all cursor-pointer ${
                    isCurrentGroup
                      ? 'liquid-cta-primary shadow-sm'
                      : 'liquid-pill text-white/60 hover:text-white'
                  }`}
                >
                  {start} - {end}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-white/50 text-xs">
            Tổng cộng <strong className="text-white">{episodeDataList.length}</strong> tập
          </div>
        )}

        <div className="flex items-center gap-4 ml-auto">
          {onToggleAutoNext && (
            <label className="flex items-center gap-2 cursor-pointer select-none text-white/70 hover:text-white">
              <input
                type="checkbox"
                checked={autoNext}
                onChange={onToggleAutoNext}
                className="accent-white rounded cursor-pointer"
              />
              <span className="text-xs font-semibold">Tự chuyển tập</span>
            </label>
          )}

          <button
            onClick={handleReport}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {reportSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã báo lỗi!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Báo lỗi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Episode Grid (Responsive 4 cols on mobile, 6 on tablet, 8 on desktop, 10 on wide) */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {currentChunk.map((ep) => {
          const isActive = ep.slug === currentEpisodeSlug;
          return (
            <button
              key={ep.slug}
              onClick={() => onSelectEpisode(currentServerIndex, ep)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all truncate flex items-center justify-center gap-1 cursor-pointer ${
                isActive
                  ? 'liquid-cta-primary font-black scale-105 shadow-md'
                  : 'liquid-pill text-white/80 hover:bg-white hover:text-black'
              }`}
            >
              {isActive && <Play className="w-3 h-3 fill-current shrink-0 text-black" />}
              <span className="truncate">{ep.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
