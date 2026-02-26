"use client";

import { useState } from "react";
import { Youtube, X } from "lucide-react";

interface Props {
  youtubeKey: string | null;
  title: string;
}

export function TrailerButton({ youtubeKey, title }: Props) {
  const [open, setOpen] = useState(false);

  if (!youtubeKey) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all"
      >
        <Youtube className="size-4 text-red-500" />
        Trailer
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 bg-black/70 hover:bg-red-600 rounded-full p-1.5 text-white transition-colors"
            >
              <X className="size-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
              title={`${title} — Trailer`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
