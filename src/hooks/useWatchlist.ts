"use client";

import { useState, useCallback } from "react";

export interface WatchlistItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
  date: string;
}

const KEY = "2phim_watchlist";

function readStorage(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeStorage(items: WatchlistItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => readStorage());

  const toggle = useCallback((item: WatchlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.type === item.type);
      const next = exists
        ? prev.filter((i) => !(i.id === item.id && i.type === item.type))
        : [item, ...prev];
      writeStorage(next);
      return next;
    });
  }, []);

  const isInList = useCallback(
    (id: number, type: "movie" | "tv") =>
      items.some((i) => i.id === id && i.type === type),
    [items]
  );

  return { items, toggle, isInList };
}
