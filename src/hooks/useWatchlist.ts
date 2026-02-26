"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface WatchlistItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
  date: string;
}

const KEY = "2phim_watchlist";

let cachedItems: WatchlistItem[] | null = null;
let listeners: Array<() => void> = [];

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

function getSnapshot() {
  if (!cachedItems) {
    cachedItems = readStorage();
  }
  return cachedItems;
}

function getServerSnapshot() {
  return [];
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function updateItems(newItems: WatchlistItem[]) {
  cachedItems = newItems;
  writeStorage(newItems);
  listeners.forEach((l) => l());
}

export function useWatchlist() {
  const items = useSyncExternalStore<WatchlistItem[]>(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((item: WatchlistItem) => {
    const prev = getSnapshot();
    const exists = prev.some((i) => i.id === item.id && i.type === item.type);
    const next = exists
      ? prev.filter((i) => !(i.id === item.id && i.type === item.type))
      : [item, ...prev];
    
    updateItems(next);
  }, []);

  const isInList = useCallback(
    (id: number, type: "movie" | "tv") =>
      items.some((i) => i.id === id && i.type === type),
    [items]
  );

  return { items, toggle, isInList };
}
