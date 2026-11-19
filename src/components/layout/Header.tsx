import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bookmark,
  History,
  Menu,
  X,
  ChevronDown,
  Compass,
  Sparkles,
  Film,
  Tv,
  Clapperboard,
  Crown,
  User as UserIcon,
  LogOut,
  Globe,
  Grid,
} from 'lucide-react';
import { LiveSearchModal } from '../search/LiveSearchModal';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, COUNTRIES } from '../../api/phimApi';

interface HeaderProps {
  isScrolled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isScrolled = false }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'genre' | 'country' | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-dropdown-container')) {
        setOpenDropdown(null);
      }
      if (!target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname, location.search]);

  // Hover handlers for dropdown menus
  const handleMouseEnter = (type: 'genre' | 'country') => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setOpenDropdown(type);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  // Determine active route & filters
  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get('type');
  const currentCategory = searchParams.get('category');
  const currentCountry = searchParams.get('country');

  const isHomeActive = location.pathname === '/';
  const isCinemaActive = location.pathname === '/kham-pha' && currentType === 'phim-chieu-rap';
  const isSeriesActive = location.pathname === '/kham-pha' && currentType === 'phim-bo';
  const isSingleActive = location.pathname === '/kham-pha' && currentType === 'phim-le';
  const isAnimeActive = location.pathname === '/kham-pha' && currentType === 'hoat-hinh';
  const isTvShowsActive = location.pathname === '/kham-pha' && currentType === 'tv-shows';
  const isExploreGeneralActive =
    location.pathname === '/kham-pha' && !currentType && !currentCategory && !currentCountry;
  const isGenreActive = location.pathname === '/kham-pha' && !!currentCategory;
  const isCountryActive = location.pathname === '/kham-pha' && !!currentCountry;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 select-none ${
          isScrolled
            ? 'bg-[#050507]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-b from-[#050507]/90 via-[#050507]/60 to-transparent backdrop-blur-[6px] border-b border-white/5'
        }`}
      >
        <div className="max-w-[1720px] mx-auto h-14 sm:h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          {/* CỤM 1: MOBILE MENU TRIGGER & BRAND LOGO */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              aria-label="Mở menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Apple VisionOS Liquid Glass 2PHIM Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs sm:text-sm tracking-tighter shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
                2
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-white/90 transition-colors">
                PHIM
              </span>
            </Link>
          </div>

          {/* CỤM 2: DESKTOP NAVIGATION CAPSULE (CHUẨN VISIONOS GLASS THEO ẢNH 2 CỦA USER) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10">
            {/* 1. Trang Chủ */}
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isHomeActive
                  ? 'bg-white/20 text-white font-black shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isHomeActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
              <span>Trang Chủ</span>
            </Link>

            {/* 2. Chiếu Rạp (Khớp ảnh 2: • Chiếu Rạp) */}
            <Link
              to="/kham-pha?type=phim-chieu-rap"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCinemaActive
                  ? 'bg-white/20 text-white font-black shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isCinemaActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
              <span>Chiếu Rạp</span>
            </Link>

            {/* 3. Phim Bộ */}
            <Link
              to="/kham-pha?type=phim-bo"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSeriesActive
                  ? 'bg-white/20 text-white font-black shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isSeriesActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
              <span>Phim Bộ</span>
            </Link>

            {/* 4. Phim Lẻ */}
            <Link
              to="/kham-pha?type=phim-le"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSingleActive
                  ? 'bg-white/20 text-white font-black shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isSingleActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
              <span>Phim Lẻ</span>
            </Link>

            {/* 5. Anime */}
            <Link
              to="/kham-pha?type=hoat-hinh"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAnimeActive
                  ? 'bg-white/20 text-white font-black shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isAnimeActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
              <span>Anime</span>
            </Link>

            {/* 6. Truyền Hình (Ảnh 2 của user) */}
            <Link
              to="/kham-pha?type=tv-shows"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isTvShowsActive
                  ? 'bg-white/20 text-white font-black shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {isTvShowsActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
              <span>Truyền Hình</span>
            </Link>

            {/* 7. Thể Loại Dropdown */}
            <div
              className="relative header-dropdown-container"
              onMouseEnter={() => handleMouseEnter('genre')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isGenreActive || openDropdown === 'genre'
                    ? 'bg-white/20 text-white font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {isGenreActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
                <span>Thể Loại</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    openDropdown === 'genre' ? 'rotate-180 text-white' : 'text-white/50'
                  }`}
                />
              </button>

              {openDropdown === 'genre' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-[340px] p-3 rounded-2xl bg-[#141419]/95 backdrop-blur-2xl border border-white/15 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] font-bold text-white/50 px-1 uppercase tracking-wider">
                      <span>Chọn Thể Loại</span>
                      <Link
                        to="/kham-pha"
                        onClick={() => setOpenDropdown(null)}
                        className="text-white/70 hover:text-white hover:underline lowercase font-normal"
                      >
                        tất cả →
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {CATEGORIES.slice(0, 18).map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/kham-pha?category=${cat.slug}`}
                          onClick={() => setOpenDropdown(null)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate transition-all ${
                            currentCategory === cat.slug
                              ? 'bg-white text-black font-bold shadow-sm'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 8. Quốc Gia Dropdown */}
            <div
              className="relative header-dropdown-container"
              onMouseEnter={() => handleMouseEnter('country')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isCountryActive || openDropdown === 'country'
                    ? 'bg-white/20 text-white font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {isCountryActive && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />}
                <span>Quốc Gia</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    openDropdown === 'country' ? 'rotate-180 text-white' : 'text-white/50'
                  }`}
                />
              </button>

              {openDropdown === 'country' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-[260px] p-3 rounded-2xl bg-[#141419]/95 backdrop-blur-2xl border border-white/15 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] font-bold text-white/50 px-1 uppercase tracking-wider">
                      <span>Chọn Quốc Gia</span>
                      <Link
                        to="/kham-pha"
                        onClick={() => setOpenDropdown(null)}
                        className="text-white/70 hover:text-white hover:underline lowercase font-normal"
                      >
                        tất cả →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {COUNTRIES.map((ct) => (
                        <Link
                          key={ct.slug}
                          to={`/kham-pha?country=${ct.slug}`}
                          onClick={() => setOpenDropdown(null)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate transition-all ${
                            currentCountry === ct.slug
                              ? 'bg-white text-black font-bold shadow-sm'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {ct.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 8. Khám Phá Full Matrix */}
            <Link
              to="/kham-pha"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isExploreGeneralActive
                  ? 'bg-white text-black font-black shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Khám Phá</span>
            </Link>
          </nav>

          {/* CỤM 3: RIGHT ACTION UTILITIES (TÌM KIẾM, ĐÃ LƯU, LỊCH SỬ, PROFILE) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* ⌘K Command Search Pill */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="h-8.5 sm:h-9.5 px-3 sm:px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-white/70 hover:text-white transition-all cursor-pointer group shadow-sm"
              aria-label="Tìm kiếm phim"
              title="Tìm kiếm phim (⌘K)"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline text-xs font-semibold text-white/75 group-hover:text-white">
                Tìm kiếm...
              </span>
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-white/50 bg-white/10 rounded border border-white/10 ml-0.5">
                ⌘K
              </kbd>
            </button>

            {/* Bookmark Pill */}
            <Link
              to="/tai-khoan"
              className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/75 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Phim đã lưu"
              aria-label="Phim đã lưu"
            >
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* History Pill */}
            <Link
              to="/tai-khoan"
              className="hidden sm:flex w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 items-center justify-center text-white/75 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Lịch sử xem phim"
              aria-label="Lịch sử xem"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* User Profile Dropdown or Login CTA */}
            {isAuthenticated && user ? (
              <div className="relative user-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="h-8.5 sm:h-9.5 pl-1.5 pr-2.5 sm:pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="hidden md:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden md:inline w-3 h-3 text-white/50" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-64 p-3.5 rounded-2xl bg-[#141419]/95 backdrop-blur-2xl space-y-2 border border-white/20 shadow-2xl">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          {user.isVip ? (
                            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
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
                          <Bookmark className="w-3.5 h-3.5 text-white/70" />
                          <span>Phim đã lưu</span>
                        </Link>
                        <Link
                          to="/lich-su"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <History className="w-3.5 h-3.5 text-white/70" />
                          <span>Lịch sử xem</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <button
                          type="button"
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
                className="h-8.5 sm:h-9.5 px-3.5 sm:px-4.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(255,255,255,0.3)]"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE SLIDE-OUT MENU DRAWER (PORTALED TO BODY TO AVOID BACKDROP-FILTER CLIPPING) */}
        {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="lg:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 bg-[#070709]/98 backdrop-blur-2xl z-[99999] p-4 pb-16 overflow-y-auto space-y-4 animate-in slide-in-from-top-4 duration-200 border-t border-white/10"
          >
            {/* User Auth Banner */}
            {!isAuthenticated || !user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-3 rounded-xl bg-white text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký Tài Khoản</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full ring-1 ring-white/40 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <span className="text-[10px] text-white/50">{user.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 shrink-0 ml-2 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            {/* Primary Category Links */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 px-1">
                Danh Mục Chính
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isHomeActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trang Chủ</span>
                </Link>

                <Link
                  to="/kham-pha"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isExploreGeneralActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Khám Phá Phim</span>
                </Link>

                <Link
                  to="/kham-pha?type=phim-chieu-rap"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isCinemaActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Phim Chiếu Rạp</span>
                </Link>

                <Link
                  to="/kham-pha?type=phim-bo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isSeriesActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Phim Bộ Hot</span>
                </Link>

                <Link
                  to="/kham-pha?type=phim-le"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isSingleActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>Phim Lẻ Mới</span>
                </Link>

                <Link
                  to="/kham-pha?type=hoat-hinh"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isAnimeActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Anime & Hoạt Hình</span>
                </Link>

                <Link
                  to="/kham-pha?type=tv-shows"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isTvShowsActive
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Truyền Hình</span>
                </Link>
              </div>
            </div>

            {/* Popular Genres on Mobile */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 px-1">
                Thể Loại Phổ Biến
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.slice(0, 12).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/kham-pha?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-lg text-center truncate ${
                      currentCategory === cat.slug
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Countries on Mobile */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 px-1">
                Quốc Gia
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {COUNTRIES.slice(0, 6).map((ct) => (
                  <Link
                    key={ct.slug}
                    to={`/kham-pha?country=${ct.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-lg text-center truncate ${
                      currentCountry === ct.slug
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {ct.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Saved & History */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 pb-6">
              <Link
                to="/yeu-thich"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-white/60" />
                <span>Phim Đã Lưu</span>
              </Link>
              <Link
                to="/lich-su"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-white/60" />
                <span>Lịch Sử Xem</span>
              </Link>
            </div>
          </div>,
          document.body
        )}
      </header>

      {/* ⌘K Live Search Modal */}
      <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
