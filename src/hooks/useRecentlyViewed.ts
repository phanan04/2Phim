"use client";

import { useState, useCallback, useEffect } from "react";
import type { MediaType } from "@/types";

export interface RecentlyViewedItem {
  id: number;
  title: string;
  poster_path: string | null;
  type: MediaType;
  vote_average: number;
  date: string;
  viewedAt: number;
}

const STORAGE_KEY = "2phim_recently_viewed";
const MAX_ITEMS = 12;

function readStorage(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeStorage(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  const trackView = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    const existing = readStorage().filter((i) => !(i.id === item.id && i.type === item.type));
    const updated = [{ ...item, viewedAt: Date.now() }, ...existing].slice(0, MAX_ITEMS);
    writeStorage(updated);
    setItems(updated);
  }, []);

  const clearHistory = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  return { items, trackView, clearHistory };
}
