import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#050507] text-white/50 text-xs py-4 px-4 sm:px-8 relative z-20 select-none">
      <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <Link to="/" className="flex items-center gap-1.5 font-black text-white hover:opacity-80 transition-opacity">
            <span className="w-5 h-5 rounded-md bg-white text-black text-[11px] font-black flex items-center justify-center shadow-sm">
              2
            </span>
            <span className="tracking-tight text-sm">PHIM</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-white/60 text-xs">© 2026 2Phim. Tất cả quyền được bảo lưu.</span>
        </div>

        <p className="text-[11px] text-white/35 max-w-xl truncate">
          Dữ liệu phim được tổng hợp tự động từ các nguồn chia sẻ mở trên Internet.
        </p>
      </div>
    </footer>
  );
};
