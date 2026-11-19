import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bookmark,
  History,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Crown,
  User as UserIcon,
  LogOut,
  Compass,
} from 'lucide-react';
import { LiveSearchModal } from '../search/LiveSearchModal';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  isScrolled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isScrolled = false }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isExploreActive =
    location.pathname.startsWith('/kham-pha') ||
    location.pathname.startsWith('/danh-sach') ||
    location.pathname.startsWith('/the-loai') ||
    location.pathname.startsWith('/quoc-gia');

  return (
    <>
      <header className="fixed top-2.5 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 lg:px-10 pointer-events-none transition-all duration-300">
        <div
          ref={dropdownRef}
          className="max-w-[1720px] mx-auto flex items-center justify-between gap-3 pointer-events-auto transition-all duration-300"
        >
          {/* Cụm 1: Logo & Mobile Trigger (Floating Liquid Pill) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden liquid-pill w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white shadow-lg cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Apple Liquid Glass 2PHIM Brand Pill Island */}
            <Link
              to="/"
              className="liquid-pill h-9 sm:h-10 px-3.5 sm:px-4 rounded-full flex items-center gap-2 sm:gap-2.5 group cursor-pointer shadow-lg"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-white text-black flex items-center justify-center group-hover:scale-105 transition-all shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                <span className="text-black font-black text-xs sm:text-sm tracking-tighter">2</span>
              </div>
              <span className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-white transition-colors">
                PHIM
              </span>
            </Link>
          </div>

          {/* Cụm 2: Center Segmented Glass Navigation (Trang Chủ & Khám Phá) */}
          <nav className="hidden md:flex items-center p-1 sm:p-1.5 rounded-full liquid-glass border border-white/15 shadow-xl">
            <Link
              to="/"
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-white text-[#070709] font-extrabold shadow-[0_0_18px_rgba(255,255,255,0.4)]'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              Trang Chủ
            </Link>

            <Link
              to="/kham-pha"
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                isExploreActive
                  ? 'bg-white text-[#070709] font-extrabold shadow-[0_0_18px_rgba(255,255,255,0.4)]'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Khám Phá</span>
            </Link>
          </nav>

          {/* Cụm 3: Right Action Utilities (Floating Liquid Pills) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* ⌘K Command Search Pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="liquid-pill h-9 sm:h-10 px-3 sm:px-4 rounded-full flex items-center gap-2 text-white/70 hover:text-white transition-all cursor-pointer shadow-lg group"
              aria-label="Tìm kiếm phim"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline text-xs font-semibold text-white/80">
                Tìm kiếm...
              </span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-white/60 bg-white/10 rounded-md border border-white/10 ml-0.5">
                ⌘K
              </kbd>
            </button>

            {/* Bookmark & History Pills */}
            <Link
              to="/tai-khoan"
              className="hidden sm:flex liquid-pill w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-lg"
              title="Phim đã lưu"
              aria-label="Phim đã lưu"
            >
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            <Link
              to="/tai-khoan"
              className="hidden sm:flex liquid-pill w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-lg"
              title="Lịch sử xem"
              aria-label="Lịch sử xem"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* User Profile or Login CTA */}
            {isAuthenticated && user ? (
              <div className="relative user-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="liquid-pill h-9 sm:h-10 pl-1.5 pr-2.5 sm:pr-3 rounded-full flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-white/40"
                  />
                  <span className="hidden md:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden md:inline w-3 h-3 text-white/60" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-64 p-3.5 rounded-3xl liquid-glass space-y-2 border border-white/20 shadow-2xl">
                      <div className="p-2.5 rounded-2xl bg-white/8 border border-white/15">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          {user.isVip ? (
                            <span className="px-2 py-0.5 rounded-full bg-white text-[#070709] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Crown className="w-2.5 h-2.5 fill-current" /> VIP
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/50">Thường</span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/60 truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="space-y-1">
                        <Link
                          to="/yeu-thich"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-white" />
                          <span>Phim đã lưu</span>
                        </Link>
                        <Link
                          to="/lich-su"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <History className="w-3.5 h-3.5 text-white" />
                          <span>Lịch sử xem</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="liquid-cta-primary h-9 sm:h-10 px-4 sm:px-5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden liquid-glass mx-auto max-w-[1520px] mt-2 rounded-3xl p-4 space-y-4 max-h-[85vh] overflow-y-auto pointer-events-auto border border-white/20 shadow-2xl">
            {!isAuthenticated || !user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-full liquid-cta-primary text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký VIP</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/8 border border-white/15">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-1 ring-white/50"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <span className="text-[10px] text-white/70 font-semibold">VIP Member</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-red-400 hover:bg-red-500/10"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            {/* Main Links */}
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  location.pathname === '/'
                    ? 'bg-white text-black font-black'
                    : 'bg-white/6 text-white/85 hover:text-white hover:bg-white/14'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Trang Chủ
              </Link>

              <Link
                to="/kham-pha"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isExploreActive
                    ? 'bg-white text-black font-black'
                    : 'bg-white/6 text-white/85 hover:text-white hover:bg-white/14'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Khám Phá
              </Link>
            </div>

            {/* Quick Filter Shortcuts */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-white/60 mb-2">
                Bộ Lọc Phổ Biến
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/kham-pha?type=phim-chieu-rap"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 truncate"
                >
                  🎬 Phim Chiếu Rạp
                </Link>
                <Link
                  to="/kham-pha?type=phim-bo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 truncate"
                >
                  📺 Phim Bộ Đang Hot
                </Link>
                <Link
                  to="/kham-pha?type=phim-le"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 truncate"
                >
                  🍿 Phim Lẻ Đặc Sắc
                </Link>
                <Link
                  to="/kham-pha?type=hoat-hinh"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 truncate"
                >
                  🎨 Anime & Hoạt Hình
                </Link>
              </div>
            </div>

            {/* Quick Links for saved and history */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
              <Link
                to="/yeu-thich"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-white/70" />
                <span>Phim Đã Lưu</span>
              </Link>
              <Link
                to="/lich-su"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-white/70" />
                <span>Lịch Sử Xem</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ⌘K Live Search Modal */}
      <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
