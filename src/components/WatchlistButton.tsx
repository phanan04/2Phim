"use client";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";
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
        if (saved) {
          toast("Đã xóa khỏi danh sách yêu thích");
        } else {
          toast.success(`Đã lưu "${item.title}" vào yêu thích`);
        }
      }}
      title={saved ? "Xóa khỏi danh sách" : "Lưu vào danh sách"}
      className={cn(
        "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all border",
        saved
          ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white"
          : "bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 hover:border-gray-300 dark:hover:border-white/40",
        className
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-white dark:fill-black")} />
      {saved ? "Đã lưu" : "Lưu phim"}
    </button>
  );
}
