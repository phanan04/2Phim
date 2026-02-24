"use client";

import { Bookmark } from "lucide-react";
import { useWatchlist, type WatchlistItem } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface Props {
  item: WatchlistItem;
}

export function CardBookmark({ item }: Props) {
  const { toggle, isInList } = useWatchlist();
  const saved = isInList(item.id, item.type);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      title={saved ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      className={cn(
        "absolute top-2 left-2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10",
        saved
          ? "bg-red-600 text-white"
          : "bg-black/70 text-gray-300 hover:bg-black/90"
      )}
    >
      <Bookmark className={cn("size-3.5", saved && "fill-white")} />
    </button>
  );
}
