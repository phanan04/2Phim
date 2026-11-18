import React from 'react';
import { X, Play, Film, AlertCircle } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieName: string;
  trailerUrl?: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  movieName,
  trailerUrl,
}) => {
  if (!isOpen) return null;

  // Convert YouTube regular watch link to embed link if needed
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden liquid-glass-dropdown border border-white/15 p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 max-w-[80%] truncate">
            <span className="p-2 rounded-xl bg-[#FECF59]/15 text-[#FECF59] border border-[#FECF59]/30">
              <Film className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-black text-white truncate">
                Trailer Chính Thức: {movieName}
              </h3>
              <p className="text-[11px] text-[#FECF59] font-bold">Chất lượng 1080p Full HD</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black mt-3 sm:mt-4 border border-white/10">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Trailer: ${movieName}`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <AlertCircle className="w-7 h-7 text-[#FECF59]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm sm:text-base">
                  Chưa có trailer chính thức cho phim này
                </p>
                <p className="text-xs text-white/50 mt-1 max-w-md">
                  Bạn có thể bấm "Xem Ngay" để thưởng thức trọn bộ các tập phim với chất lượng cao nhất.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
