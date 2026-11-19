import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../api/phimApi';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#050507] text-white/60 relative z-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl liquid-pill flex items-center justify-center font-black text-sm tracking-tight text-white border-top border-white/40">
                2
              </div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-white/80 transition-colors">
                PHIM
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-md">
              <strong className="text-white">2Phim</strong> — Nền tảng xem phim trực tuyến thế hệ mới.
              Kho phim bom tấn phong phú cập nhật liên tục với phụ đề Vietsub và Thuyết minh chuẩn nhất.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40 pt-1">
              <ShieldCheck className="w-4 h-4 text-white/60" />
              <span>Dữ liệu tổng hợp tự động từ các nguồn chia sẻ mở.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/90 mb-4 flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-white/70" /> Chuyên Mục
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/danh-sach/phim-chieu-rap" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white/60" /> Chiếu Rạp Hot
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/phim-bo" className="hover:text-white transition-colors">
                  Phim Bộ Hay Nhất
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/phim-le" className="hover:text-white transition-colors">
                  Phim Lẻ Mới
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/hoat-hinh" className="hover:text-white transition-colors">
                  Anime Hoạt Hình
                </Link>
              </li>
              <li>
                <Link to="/danh-sach/tv-shows" className="hover:text-white transition-colors">
                  Truyền Hình TV Shows
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/90 mb-4">
              Thể Loại Nổi Bật
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/the-loai/${cat.slug}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 2Phim. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1">
            Thiết kế giao diện Apple Liquid Glass tối giản & siêu nhẹ mượt.
          </p>
        </div>
      </div>
    </footer>
  );
};
