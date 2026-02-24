"use client";

import { useState, useCallback, useEffect } from "react";

export interface ContinueWatchingItem {
  id: number;
  title: string;
  poster_path: string | null;
  season: number;
  episode: number;
  updatedAt: number;
}

const STORAGE_KEY = "2phim_continue_watching";
const MAX_ITEMS = 10;

function readStorage(): Record<string, ContinueWatchingItem> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeStorage(data: Record<string, ContinueWatchingItem>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    const data = readStorage();
    const sorted = Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt);
    setItems(sorted);
  }, []);

  const saveProgress = useCallback(
    (
      id: number,
      title: string,
      poster_path: string | null,
      season: number,
      episode: number
    ) => {
      const data = readStorage();
      data[String(id)] = { id, title, poster_path, season, episode, updatedAt: Date.now() };
      // Keep only latest MAX_ITEMS
      const sorted = Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt);
      const trimmed = sorted.slice(0, MAX_ITEMS);
      const trimmedMap: Record<string, ContinueWatchingItem> = {};
      trimmed.forEach((item) => (trimmedMap[String(item.id)] = item));
      writeStorage(trimmedMap);
      setItems(trimmed);
    },
    []
  );

  const removeProgress = useCallback((id: number) => {
    const data = readStorage();
    delete data[String(id)];
    writeStorage(data);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const getProgress = useCallback(
    (id: number): ContinueWatchingItem | null => {
      return readStorage()[String(id)] ?? null;
    },
    []
  );

  return { items, saveProgress, removeProgress, getProgress };
}
