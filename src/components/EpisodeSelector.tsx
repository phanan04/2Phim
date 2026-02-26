"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import type { TMDBSeasonDetail, TMDBTVShow } from "@/types";
import { cn } from "@/lib/utils";

interface EpisodeSelectorProps {
  show: TMDBTVShow;
  seasons: number[];
  initialSeasonData: TMDBSeasonDetail;
  initialSeason?: number;
  initialEpisode?: number;
}

export function EpisodeSelector({
  show,
  seasons,
  initialSeasonData,
  initialSeason,
  initialEpisode,
}: EpisodeSelectorProps) {
  const router = useRouter();
  const { saveProgress } = useContinueWatching();
  const [selectedSeason, setSelectedSeason] = useState(initialSeason ?? initialSeasonData.season_number);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode ?? 1);
  const [seasonData, setSeasonData] = useState(initialSeasonData);
  const [loadingSeason, setLoadingSeason] = useState(false);

  // If initialSeason differs from initialSeasonData, load the correct season
  useEffect(() => {
    if (initialSeason && initialSeason !== initialSeasonData.season_number) {
      loadSeason(initialSeason, initialEpisode ?? 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateURL = (season: number, episode: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", String(season));
    url.searchParams.set("ep", String(episode));
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const loadSeason = async (seasonNum: number, startEpisode = 1) => {
    setLoadingSeason(true);
    try {
      const res = await fetch(`/api/tv-season?id=${show.id}&season=${seasonNum}`);
      const data = await res.json();
      setSeasonData(data);
      setSelectedSeason(seasonNum);
      setSelectedEpisode(startEpisode);
      updateURL(seasonNum, startEpisode);
      saveProgress(show.id, show.name, show.poster_path, seasonNum, startEpisode);
    } finally {
      setLoadingSeason(false);
    }
  };

  const handleEpisodeSelect = (epNum: number) => {
    setSelectedEpisode(epNum);
    updateURL(selectedSeason, epNum);
    saveProgress(show.id, show.name, show.poster_path, selectedSeason, epNum);
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <VideoPlayer
        tmdbId={show.id}
        type="tv"
        season={selectedSeason}
        episode={selectedEpisode}
      />

      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Đang xem: S{selectedSeason} E{selectedEpisode}
      </div>

      {/* Season Selector */}
      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold">Chọn mùa</h3>
        <div className="flex flex-wrap gap-2">
          {seasons.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={selectedSeason === s ? "default" : "outline"}
              onClick={() => loadSeason(s)}
              disabled={loadingSeason}
              className={cn(
                selectedSeason === s
                  ? "bg-red-600 hover:bg-red-700 border-red-600"
                  : "border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Mùa {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Episode List */}
      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold">
          Tập phim — {seasonData.name}
        </h3>
        {loadingSeason ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">Đang tải danh sách tập...</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {seasonData.episodes.map((ep) => (
              <button
                key={ep.episode_number}
                onClick={() => handleEpisodeSelect(ep.episode_number)}
                className={cn(
                  "aspect-square rounded-lg text-sm font-semibold transition-all",
                  selectedEpisode === ep.episode_number
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {ep.episode_number}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
