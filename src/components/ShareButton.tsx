"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  className?: string;
}

export function ShareButton({ title, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Use Web Share API if available (mobile/supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or error — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã sao chép liên kết!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Chia sẻ"
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all border",
        "bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20",
        "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white",
        className
      )}
    >
      {copied ? (
        <Check className="size-4 text-green-500" />
      ) : (
        <Share2 className="size-4" />
      )}
      {copied ? "Đã sao chép" : "Chia sẻ"}
    </button>
  );
}
