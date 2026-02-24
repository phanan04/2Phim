"use client";

import { useState } from "react";
import { Youtube, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  youtubeKey: string | null;
  title: string;
}

export function TrailerButton({ youtubeKey, title }: Props) {
  const [open, setOpen] = useState(false);

  if (!youtubeKey) return null;

  return (
    <>
      <Button
        variant="outline"
        className="border-gray-300 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 gap-2"
        onClick={() => setOpen(true)}
      >
        <Youtube className="size-4 text-red-500" />
        Xem Trailer
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
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
