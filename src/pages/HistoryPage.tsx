import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, Play, Clock } from 'lucide-react';
import { storage } from '../utils/storage';
import { HistoryItem } from '../types/movie';
import { getImageUrl } from '../utils/image';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    document.title = 'Lịch Sử - 2 Phim';
    setHistory(storage.getHistory());
  }, []);

  const handleRemove = (slug: string) => {
    storage.removeHistory(slug);
    setHistory(storage.getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Xóa toàn bộ lịch sử xem phim?')) {
      storage.clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#18181C] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <History className="w-7 h-7 text-[#FECF59]" /> Lịch Sử Xem Phim
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Đã xem gần đây <strong className="text-white">{history.length}</strong> phim
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-5 py-2.5 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-all text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Xóa tất cả
          </button>
        )}
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => (
            <div
              key={item.slug}
              className="flex gap-3 p-3.5 rounded-2xl bg-[#18181C] border border-white/5 hover:border-[#FECF59]/60 transition-all group relative overflow-hidden hover:shadow-[0_0_20px_rgba(254,207,89,0.2)]"
            >
              <Link
                to={`/xem/${item.slug}/${item.episodeSlug}#tap=${item.episodeSlug}&sv=${encodeURIComponent(item.serverName)}&channel=0&server_id=0`}
                className="relative w-24 h-32 rounded-xl overflow-hidden shrink-0 bg-[#121214]"
              >
                <img
                  src={getImageUrl(item.poster_url || item.thumb_url)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-6 h-6 fill-[#FECF59] text-[#FECF59]" />
                </div>
              </Link>

              <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                <div>
                  <Link
                    to={`/xem/${item.slug}/${item.episodeSlug}#tap=${item.episodeSlug}&sv=${encodeURIComponent(item.serverName)}&channel=0&server_id=0`}
                    className="font-bold text-sm text-white group-hover:text-[#FECF59] transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-white/50 truncate mt-0.5">{item.origin_name}</p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FECF59]/20 text-[#FECF59] font-bold">
                      {item.episodeName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <Link
                    to={`/xem/${item.slug}/${item.episodeSlug}#tap=${item.episodeSlug}&sv=${encodeURIComponent(item.serverName)}&channel=0&server_id=0`}
                    className="text-xs font-bold text-[#FECF59] hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" /> Xem tiếp
                  </Link>

                  <button
                    onClick={() => handleRemove(item.slug)}
                    className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#18181C] rounded-3xl border border-white/5 text-white/50 space-y-4">
          <Clock className="w-12 h-12 text-white/20 mx-auto" />
          <div>
            <p className="text-lg font-bold text-white">Chưa có lịch sử xem</p>
            <p className="text-xs text-white/40 mt-1">Khi xem phim, hệ thống sẽ tự động lưu lại để bạn xem tiếp.</p>
          </div>
          <Link
            to="/"
            className="inline-block px-7 py-3 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black font-extrabold text-sm hover:shadow-lg transition-all"
          >
            Xem phim ngay
          </Link>
        </div>
      )}
    </div>
  );
};
