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
  Home,
  User as UserIcon,
  LogOut,
  Flame,
  Film,
  Tv,
} from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '../../api/phimApi';
import { LiveSearchModal } from '../search/LiveSearchModal';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  isScrolled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isScrolled = false }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'country' | 'user' | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Trang Chủ', path: '/' },
    { label: 'Chiếu Rạp', path: '/danh-sach/phim-chieu-rap', highlight: true },
    { label: 'Phim Bộ', path: '/danh-sach/phim-bo' },
    { label: 'Phim Lẻ', path: '/danh-sach/phim-le' },
    { label: 'Anime', path: '/danh-sach/hoat-hinh' },
    { label: 'Truyền Hình', path: '/danh-sach/tv-shows' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out py-3 sm:py-3.5 ${
          isScrolled
            ? 'liquid-glass-header shadow-[0_10px_40px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-b from-[#0E0E10]/95 via-[#0E0E10]/50 to-transparent'
        }`}
      >
        <div
          ref={dropdownRef}
          className="w-full max-w-[1920px] mx-auto px-3 sm:px-8 md:px-14 flex items-center justify-between gap-4"
        >
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 xl:gap-10">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* 2Phim Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FECF59] via-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(254,207,89,0.4)] group-hover:scale-105 transition-transform">
                <span className="text-black font-black text-xl sm:text-2xl tracking-tighter">2</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-[#FECF59] transition-colors">
                    PHIM
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 fill-current" /> VIP
                  </span>
                </div>
                <span className="hidden sm:inline text-[10px] text-white/40 tracking-wider font-semibold mt-0.5">
                  Trăm Phim Một Chỗ
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-bold transition-all relative py-1 ${
                      isActive
                        ? 'text-[#FECF59] font-extrabold'
                        : link.highlight
                        ? 'text-white hover:text-[#FECF59] flex items-center gap-1'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {link.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FECF59] animate-pulse inline-block" />
                    )}
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FECF59] rounded-full shadow-[0_0_10px_#FECF59]" />
                    )}
                  </Link>
                );
              })}

              {/* Thể Loại Dropdown (Solid Click-to-Toggle) */}
              <div className="relative header-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'category' ? null : 'category');
                  }}
                  className={`flex items-center gap-1 text-sm font-bold transition-all py-1 cursor-pointer select-none ${
                    activeDropdown === 'category' ? 'text-[#FECF59]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span>Thể Loại</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'category' ? 'rotate-180 text-[#FECF59]' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'category' && (
                  <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-80 p-3.5 rounded-2xl liquid-glass-dropdown grid grid-cols-2 gap-1.5 shadow-2xl">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/the-loai/${cat.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="px-3 py-2 text-xs font-semibold text-white/75 hover:text-[#FECF59] hover:bg-white/10 rounded-xl transition-all truncate"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quốc Gia Dropdown (Solid Click-to-Toggle) */}
              <div className="relative header-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'country' ? null : 'country');
                  }}
                  className={`flex items-center gap-1 text-sm font-bold transition-all py-1 cursor-pointer select-none ${
                    activeDropdown === 'country' ? 'text-[#FECF59]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span>Quốc Gia</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'country' ? 'rotate-180 text-[#FECF59]' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'country' && (
                  <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-72 p-3.5 rounded-2xl liquid-glass-dropdown grid grid-cols-2 gap-1.5 shadow-2xl">
                      {COUNTRIES.map((cou) => (
                        <Link
                          key={cou.slug}
                          to={`/quoc-gia/${cou.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="px-3 py-2 text-xs font-semibold text-white/75 hover:text-[#FECF59] hover:bg-white/10 rounded-xl transition-all truncate"
                        >
                          {cou.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Action Buttons (Liquid Glass Styled) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Pill Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:px-4 sm:py-2 rounded-full liquid-glass-button text-white/80 hover:text-white text-xs font-bold flex items-center gap-2.5 group transition-all"
              title="Tìm kiếm phim (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-[#FECF59] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-white/70 group-hover:text-white">Tìm kiếm...</span>
              <kbd className="hidden md:inline text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 font-mono">
                Ctrl+K
              </kbd>
            </button>

            {/* Bookmark */}
            <Link
              to="/yeu-thich"
              className="p-2 sm:p-2.5 rounded-full liquid-glass-button text-white/80 hover:text-[#FECF59]"
              title="Phim đã lưu"
            >
              <Bookmark className="w-4 h-4" />
            </Link>

            {/* History */}
            <Link
              to="/lich-su"
              className="p-2 sm:p-2.5 rounded-full liquid-glass-button text-white/80 hover:text-[#FECF59]"
              title="Lịch sử xem"
            >
              <History className="w-4 h-4" />
            </Link>

            {/* AUTH BUTTON / USER PROFILE (Liquid Glass) */}
            {isAuthenticated && user ? (
              <div className="relative header-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'user' ? null : 'user');
                  }}
                  className="flex items-center gap-2 p-1 sm:pr-3 rounded-full liquid-glass-button cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#FECF59]/50"
                    />
                    {user.isVip && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
                        <Crown className="w-2 h-2 text-black fill-current" />
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden md:inline w-3 h-3 text-white/60" />
                </button>

                {/* User Dropdown Menu */}
                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-64 p-3 rounded-2xl liquid-glass-dropdown space-y-2">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          {user.isVip ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#FECF59]/20 text-[#FECF59] border border-[#FECF59]/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 fill-current" /> VIP
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/50">Thường</span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/50 truncate mt-0.5">{user.email}</p>
                        {user.vipExpiresAt && (
                          <p className="text-[9px] text-[#FECF59] font-medium mt-1">
                            Hạn VIP: {user.vipExpiresAt}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Link
                          to="/yeu-thich"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-[#FECF59]" />
                          <span>Phim đã lưu</span>
                        </Link>
                        <Link
                          to="/lich-su"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <History className="w-3.5 h-3.5 text-[#FECF59]" />
                          <span>Lịch sử xem</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            logout();
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
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
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(254,207,89,0.35)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden liquid-glass-dropdown mx-3 mt-2 rounded-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Mobile Auth button */}
            {!isAuthenticated || !user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FECF59] to-amber-400 text-black font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký VIP</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-[#FECF59]"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <span className="text-[10px] text-[#FECF59] font-bold">VIP Member</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-white/80 hover:text-[#FECF59] hover:bg-white/10 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FECF59]" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#FECF59] mb-2">
                Thể Loại
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/the-loai/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[11px] font-medium rounded-xl bg-white/5 text-white/70 hover:text-[#FECF59] truncate text-center"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#FECF59] mb-2">
                Quốc Gia
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {COUNTRIES.map((cou) => (
                  <Link
                    key={cou.slug}
                    to={`/quoc-gia/${cou.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[11px] font-medium rounded-xl bg-white/5 text-white/70 hover:text-[#FECF59] truncate text-center"
                  >
                    {cou.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (App-like UX for smartphone) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 liquid-glass-header px-2 py-1.5 flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold transition-colors ${
            location.pathname === '/' ? 'text-[#FECF59]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Trang Chủ</span>
        </Link>

        <Link
          to="/danh-sach/phim-chieu-rap"
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold transition-colors ${
            location.pathname.includes('phim-chieu-rap') ? 'text-[#FECF59]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Chiếu Rạp</span>
        </Link>

        <Link
          to="/danh-sach/phim-bo"
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold transition-colors ${
            location.pathname.includes('phim-bo') ? 'text-[#FECF59]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Phim Bộ</span>
        </Link>

        <Link
          to="/danh-sach/hoat-hinh"
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold transition-colors ${
            location.pathname.includes('hoat-hinh') ? 'text-[#FECF59]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Anime</span>
        </Link>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold text-white/60 hover:text-white"
        >
          <Search className="w-4 h-4" />
          <span>Tìm Kiếm</span>
        </button>
      </div>

      <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
