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
  Film,
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
      <header className="fixed top-2.5 sm:top-3.5 inset-x-0 z-50 px-3 sm:px-6 lg:px-10 pointer-events-none transition-all duration-300">
        <div
          ref={dropdownRef}
          className={`nav-shell max-w-[1520px] mx-auto flex items-center justify-between gap-3 pointer-events-auto transition-all duration-300 ${
            isScrolled ? 'nav-shell-scrolled py-2' : 'py-2.5 sm:py-3'
          }`}
        >
          {/* Left Brand Logo & Mobile Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden liquid-pill w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Apple Spatial Cinema 2PHIM Brand */}
            <Link to="/" className="flex items-center gap-2.5 pl-1.5 pr-2 group">
              <div className="w-9 h-9 rounded-2xl liquid-glass flex items-center justify-center border border-white/35 group-hover:scale-105 transition-all shadow-[0_4px_16px_rgba(255,255,255,0.12)]">
                <span className="text-white font-extrabold text-base tracking-tighter">2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-white transition-colors">
                  PHIM
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase bg-white/10 border border-white/20 text-white/85 shadow-sm">
                  4K Spatial
                </span>
              </div>
            </Link>
          </div>

          {/* Center Segmented Glass Navigation */}
          <nav className="hidden lg:flex items-center p-1 rounded-full liquid-glass border border-white/15">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 xl:px-4 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-white text-[#070709] font-extrabold shadow-[0_0_18px_rgba(255,255,255,0.4)]'
                      : link.highlight
                      ? 'text-white hover:text-white hover:bg-white/10 flex items-center gap-1.5'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] inline-block" />
                  )}
                  {link.label}
                </Link>
              );
            })}

            {/* Dropdown Thể Loại */}
            <div className="relative header-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'category' ? null : 'category');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeDropdown === 'category'
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Thể Loại</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === 'category' ? 'rotate-180 text-white' : 'opacity-70'
                  }`}
                />
              </button>

              {activeDropdown === 'category' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-80 p-3.5 rounded-3xl liquid-glass grid grid-cols-2 gap-1.5 shadow-2xl border border-white/20">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/the-loai/${cat.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/14 rounded-xl transition-all truncate"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Quốc Gia */}
            <div className="relative header-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'country' ? null : 'country');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeDropdown === 'country'
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Quốc Gia</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === 'country' ? 'rotate-180 text-white' : 'opacity-70'
                  }`}
                />
              </button>

              {activeDropdown === 'country' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-72 p-3.5 rounded-3xl liquid-glass grid grid-cols-2 gap-1.5 shadow-2xl border border-white/20">
                    {COUNTRIES.map((cou) => (
                      <Link
                        key={cou.slug}
                        to={`/quoc-gia/${cou.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/14 rounded-xl transition-all truncate"
                      >
                        {cou.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Utilities (Liquid Pills) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* ⌘K Command Search Pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="liquid-pill h-9 sm:h-10 px-3 sm:px-4 rounded-full flex items-center gap-2 text-white/85 hover:text-white text-xs font-medium cursor-pointer"
              title="Tìm kiếm phim (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-white/80" />
              <span className="hidden sm:inline text-white/70">Tìm kiếm...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-white/12 border border-white/20 text-[9px] font-bold text-white/80">
                ⌘K
              </kbd>
            </button>

            {/* Bookmark Pill */}
            <Link
              to="/yeu-thich"
              className="liquid-pill w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/85 hover:text-white"
              title="Phim đã lưu"
            >
              <Bookmark className="w-4 h-4" />
            </Link>

            {/* History Pill */}
            <Link
              to="/lich-su"
              className="liquid-pill w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/85 hover:text-white"
              title="Lịch sử xem"
            >
              <History className="w-4 h-4" />
            </Link>

            {/* Profile / Auth Button */}
            {isAuthenticated && user ? (
              <div className="relative header-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'user' ? null : 'user');
                  }}
                  className="liquid-pill h-9 sm:h-10 pl-1 pr-3 rounded-full flex items-center gap-2 cursor-pointer"
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

                {activeDropdown === 'user' && (
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
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-white" />
                          <span>Phim đã lưu</span>
                        </Link>
                        <Link
                          to="/lich-su"
                          onClick={() => setActiveDropdown(null)}
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
                            setActiveDropdown(null);
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
                className="liquid-cta-primary h-9 sm:h-10 px-4 sm:px-5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden liquid-glass mx-auto max-w-[1520px] mt-2 rounded-3xl p-4 space-y-4 max-h-[80vh] overflow-y-auto pointer-events-auto border border-white/20 shadow-2xl">
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

            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/6 text-white/85 hover:text-white hover:bg-white/14 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/75" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-white/60 mb-2">
                Thể Loại
              </p>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/the-loai/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-white/75 hover:text-white rounded-lg hover:bg-white/10 truncate"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-white/60 mb-2">
                Quốc Gia
              </p>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                {COUNTRIES.map((cou) => (
                  <Link
                    key={cou.slug}
                    to={`/quoc-gia/${cou.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-white/75 hover:text-white rounded-lg hover:bg-white/10 truncate"
                  >
                    {cou.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ⌘K Live Search Modal */}
      <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
