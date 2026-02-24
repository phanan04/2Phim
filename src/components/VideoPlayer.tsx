"use client";

import { useRef, useState } from "react";
import { Maximize2, Minimize2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTOEMBED, VIDSRC_EMBED, VIDSRC_DOMAINS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SERVERS = [
  { id: "autoembed-1", label: "Server 1" },
  { id: "autoembed-2", label: "Server 2" },
  { id: "autoembed-3", label: "Server 3" },
  { id: "autoembed-4", label: "Server 4" },
  { id: "vidsrc-0",    label: "VidSrc 1" },
  { id: "vidsrc-1",    label: "VidSrc 2" },
  { id: "vidsrc-2",    label: "VidSrc 3" },
] as const;

type ServerId = (typeof SERVERS)[number]["id"];

interface VideoPlayerProps {
  tmdbId: string | number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}

export function VideoPlayer({ tmdbId, type, season = 1, episode = 1 }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeServer, setActiveServer] = useState<ServerId>("autoembed-1");
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSrc = (server: ServerId) => {
    if (server.startsWith("vidsrc-")) {
      const idx = parseInt(server.replace("vidsrc-", ""));
      const domain = VIDSRC_DOMAINS[idx];
      return type === "movie"
        ? VIDSRC_EMBED.movie(tmdbId, domain)
        : VIDSRC_EMBED.tv(tmdbId, season, episode, domain);
    }
    const serverNum = parseInt(server.replace("autoembed-", ""));
    return type === "movie"
      ? AUTOEMBED.movie(tmdbId, serverNum)
      : AUTOEMBED.tv(tmdbId, season, episode, serverNum);
  };

  const switchServer = (server: ServerId) => {
    setLoaded(false);
    setActiveServer(server);
    setIframeKey((k) => k + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Server switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gray-400 text-xs shrink-0">Nguồn:</span>
        {SERVERS.map((s) => (
          <button
            key={s.id}
            onClick={() => switchServer(s.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              activeServer === s.id
                ? "bg-red-600 border-red-600 text-white"
                : "bg-transparent border-white/20 text-gray-400 hover:border-white/50 hover:text-white"
            )}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => { setLoaded(false); setIframeKey((k) => k + 1); }}
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="size-3" /> Tải lại
        </button>
      </div>

      {/* Player */}
      <div
        ref={containerRef}
        className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/50"
        style={{ aspectRatio: "16/9" }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="size-10 animate-spin text-red-500" />
              <p className="text-sm">Đang tải video...</p>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={getSrc(activeServer)}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="origin"
          onLoad={() => setLoaded(true)}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={toggleFullscreen}
          className="absolute bottom-3 right-3 z-20 bg-black/50 hover:bg-black/80 text-white size-8"
        >
          {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
