"use client";

import { Bookmark } from "lucide-react";
import { useWatchlist, type WatchlistItem } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface Props {
  item: WatchlistItem;
  className?: string;
}

export function WatchlistButton({ item, className }: Props) {
  const { toggle, isInList } = useWatchlist();
  const saved = isInList(item.id, item.type);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      title={saved ? "Xóa khỏi danh sách" : "Lưu vào danh sách"}
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all border",
        saved
          ? "bg-red-600 border-red-600 text-white"
          : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white",
        className
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-white")} />
      {saved ? "Đã lưu" : "Lưu phim"}
    </button>
  );
}
