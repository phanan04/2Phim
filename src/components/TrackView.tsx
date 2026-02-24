"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { MediaType } from "@/types";

interface Props {
  id: number;
  title: string;
  poster_path: string | null;
  type: MediaType;
  vote_average: number;
  date: string;
}

export function TrackView({ id, title, poster_path, type, vote_average, date }: Props) {
  const { trackView } = useRecentlyViewed();

  useEffect(() => {
    trackView({ id, title, poster_path, type, vote_average, date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  return null;
}
