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
          ? "bg-white text-black border-white"
          : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40",
        className
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-black")} />
      {saved ? "Đã lưu" : "Lưu phim"}
    </button>
  );
}
