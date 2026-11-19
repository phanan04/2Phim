import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Crown, ThumbsUp } from 'lucide-react';
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

  // Load comments
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
      avatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      isVip: isVipUser,
      rating: selectedRating,
      content: newContent.trim(),
      createdAt: 'Vừa xong',
      likes: 0,
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

  const avgRating = comments.length
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-5">
      {/* 1. Header (Đồng bộ chủ đề Obsidian & White Glass) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wide">
            Bình Luận & Đánh Giá
          </h2>
          <span className="text-xs text-white/50 font-medium">({comments.length})</span>
        </div>

        {comments.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center text-white/90">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-white">{avgRating}</span>
            <span className="text-white/40">/ 5.0</span>
          </div>
        )}
      </div>

      {/* 2. Post Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/70">Đánh giá sao:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 text-white/30 hover:text-white transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= (hoverRating || selectedRating)
                        ? 'text-white fill-white'
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
              className="text-xs text-white/70 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Đăng nhập VIP</span>
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <div>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tên hiển thị (Tùy chọn)..."
              className="w-full sm:w-60 h-8 px-3 rounded-lg bg-[#141418] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
          </div>
        )}

        <div className="relative">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value.slice(0, 1000))}
            placeholder={`Chia sẻ cảm nhận của bạn về ${movieName}...`}
            rows={3}
            className="w-full p-3.5 rounded-lg bg-[#141418] border border-white/15 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
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
            className="px-5 py-2 rounded-lg bg-white hover:bg-white/90 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi bình luận</span>
          </button>
        </div>
      </form>

      {/* 3. Comments List */}
      {comments.length > 0 ? (
        <div className="divide-y divide-white/10 pt-2">
          {comments.map((cmt) => (
            <div key={cmt.id} className="py-4 space-y-2 first:pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={cmt.avatar}
                      alt={cmt.author}
                      className="w-8 h-8 rounded-full object-cover bg-white/10"
                    />
                    {cmt.isVip && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                        <Crown className="w-2 h-2 fill-current" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{cmt.author}</span>
                      {cmt.isVip && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40">{cmt.createdAt}</span>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center text-white/90">
                  {Array.from({ length: cmt.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed pl-10.5">
                {cmt.content}
              </p>

              {/* Like action */}
              <div className="flex justify-end pl-10.5">
                <button
                  type="button"
                  onClick={() => handleLike(cmt.id)}
                  className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{cmt.likes} Hữu ích</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-white/40">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận về bộ phim!
        </div>
      )}
    </div>
  );
};
