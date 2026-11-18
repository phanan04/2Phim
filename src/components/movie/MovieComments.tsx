import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Crown, CheckCircle2, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  isVip: boolean;
  rating: number;
  content: string;
  createdAt: string;
  likes: number;
}

interface MovieCommentsProps {
  movieSlug: string;
  movieName: string;
}

export const MovieComments: React.FC<MovieCommentsProps> = ({ movieSlug, movieName }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(user?.name || '');

  const storageKey = `2phim_comments_${movieSlug}`;

  // Load comments with realistic fallback
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }

    setComments([]);
  }, [movieSlug, storageKey]);

  useEffect(() => {
    if (user?.name) {
      setAuthorName(user.name);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const name = user?.name || authorName.trim() || 'Khán giả 2Phim';
    const isVipUser = user?.isVip || false;

    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      author: name,
      avatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      isVip: isVipUser,
      rating: selectedRating,
      content: newContent.trim(),
      createdAt: 'Vừa xong',
      likes: 1,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewContent('');
  };

  const handleLike = (id: string) => {
    const updated = comments.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c));
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Calculate average rating
  const avgRating = comments.length
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 pt-4">
      {/* Header & Rating Overview */}
      <div className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FECF59]/15 text-[#FECF59] border border-[#FECF59]/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Đánh Giá & Bình Luận ({comments.length})
            </h3>
            <p className="text-xs text-white/50">Cộng đồng người xem phim tại 2Phim</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center text-[#FECF59]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-lg font-black text-white">{avgRating}</span>
          <span className="text-xs text-white/40">/ 5.0</span>
        </div>
      </div>

      {/* Post Comment Box */}
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-6 rounded-3xl liquid-glass border border-white/10 space-y-4 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/80">Bạn chấm phim mấy sao?</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-white/30 hover:text-[#FECF59] transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (hoverRating || selectedRating)
                        ? 'text-[#FECF59] fill-[#FECF59]'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-xs text-[#FECF59] hover:underline font-bold flex items-center gap-1"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Đăng nhập VIP để có huy hiệu nổi bật</span>
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <div>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tên của bạn (Tùy chọn)"
              className="w-full sm:w-64 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 outline-none focus:border-[#FECF59]"
            />
          </div>
        )}

        <div className="relative">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value.slice(0, 1000))}
            placeholder={`Chia sẻ cảm nhận của bạn về phim ${movieName}...`}
            rows={3}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm placeholder-white/30 outline-none focus:border-[#FECF59] resize-none transition-colors"
            required
          />
          <div className="absolute right-3 bottom-3 text-[10px] text-white/40">
            {newContent.length}/1000
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newContent.trim()}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Đánh Giá</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((cmt) => (
          <div
            key={cmt.id}
            className="p-4 sm:p-5 rounded-2xl liquid-glass border border-white/5 space-y-2.5 transition-all hover:border-white/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={cmt.avatar}
                    alt={cmt.author}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                  {cmt.isVip && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
                      <Crown className="w-2.5 h-2.5 text-black fill-current" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-white">{cmt.author}</span>
                    {cmt.isVip && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#FECF59]/20 text-[#FECF59] border border-[#FECF59]/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 fill-current" /> VIP
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40">{cmt.createdAt}</span>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex items-center text-[#FECF59]">
                {Array.from({ length: cmt.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed pl-12 sm:pl-13">
              {cmt.content}
            </p>

            <div className="flex justify-end pl-12 sm:pl-13">
              <button
                onClick={() => handleLike(cmt.id)}
                className="flex items-center gap-1 text-[11px] text-white/50 hover:text-[#FECF59] transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{cmt.likes} Hữu ích</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
