import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart, Sparkles, Crown } from 'lucide-react';
import { CATEGORIES } from '../../api/phimApi';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#09090B] text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00F076] via-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,118,0.3)]">
                <span className="text-black font-black text-xl">2</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#00F076] transition-colors">
                2PHIM
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" /> VIP
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-md">
              <strong className="text-white">2 Phim</strong> - Nền tảng xem phim trực tuyến miễn phí tốc độ cao.
              Kho phim bom tấn phong phú cập nhật hàng ngày với chất lượng Full HD, phụ đề Vietsub và Thuyết minh chuẩn nhất.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#00F076]" />
              <span>Dữ liệu phim tổng hợp tự động từ các nguồn chia sẻ mở.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#00F076] mb-4 flex items-center gap-2">
              <Film className="w-4 h-4" /> Chuyên Mục
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/danh-sach/phim-chieu-rap" className="hover:text-[#00F076] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00F076]" /> Chiếu Rạp Hot
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/phim-bo" className="hover:text-[#00F076] transition-colors">
                  Phim Bộ Hay Nhất
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/phim-le" className="hover:text-[#00F076] transition-colors">
                  Phim Lẻ Mới
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/hoat-hinh" className="hover:text-[#00F076] transition-colors">
                  Anime Hoạt Hình
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/tv-shows" className="hover:text-[#00F076] transition-colors">
                  Truyền Hình TV Shows
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#00F076] mb-4">
              Thể Loại Nổi Bật
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/the-loai/${cat.slug}`}
                  className="hover:text-[#00F076] transition-colors truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 2Phim. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1">
            Thiết kế với <Heart className="w-3.5 h-3.5 text-emerald-400 fill-current" /> cho người yêu điện ảnh.
          </p>
        </div>
      </div>
    </footer>
  );
};
