"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Menu, X, Bookmark, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { TMDB_IMG } from "@/lib/constants";
import Image from "next/image";

type SearchResult = {
  id: number;
  media_type: string;
  poster_path: string | null;
  title?: string;
  name?: string;
};
const searchCache = new Map<string, SearchResult[]>();

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isHomePage = pathname === "/";

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(!isHomePage);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
    setShowDropdown(false);
  }, [pathname]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setShowDropdown(false);
        setSearchOpen(false);
      }
    },
    [query, router]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!val.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      searchTimeoutRef.current = setTimeout(async () => {
        const trimmed = val.trim();
        if (searchCache.has(trimmed)) {
          setSearchResults(searchCache.get(trimmed)!);
          setShowDropdown(true);
          return;
        }
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          const results: SearchResult[] = data.results?.slice(0, 6) ?? [];
          searchCache.set(trimmed, results);
          setSearchResults(results);
          setSelectedIndex(-1);
          setShowDropdown(true);
        } catch { /* ignore */ }
      }, 300);
    },
    []
  );

  const navLinks = [
    { href: "/", label: "Trang Chủ" },
    { href: "/movies", label: "Phim" },
    { href: "/tv", label: "TV Show" },
    { href: "/watchlist", label: "Yêu Thích" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#0f0f0f]/96 backdrop-blur-md shadow-xl shadow-black/40 dark:bg-[#0f0f0f]/96"
          : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
      )}
    >
      <div className="max-w-[1600px] mx-auto flex h-16 items-center gap-6 px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="size-8 rounded-lg bg-white flex items-center justify-center font-black text-black text-lg leading-none select-none group-hover:bg-white/90 transition-colors">
            2
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">Phim</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-150",
                  isActive
                    ? "text-white bg-white/15"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right icons — chỉ giữ những gì cần thiết */}
        <div className="ml-auto flex items-center gap-1">

          {/* Search */}
          <div className="relative hidden md:block">
            {searchOpen ? (
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
                  <input
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowDropdown(false);
                        setSearchOpen(false);
                        setQuery("");
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedIndex((p) => Math.min(p + 1, searchResults.length - 1));
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedIndex((p) => Math.max(p - 1, -1));
                      } else if (e.key === "Enter" && selectedIndex >= 0 && searchResults[selectedIndex]) {
                        e.preventDefault();
                        const r = searchResults[selectedIndex];
                        router.push(r.media_type === "movie" ? `/movie/${r.id}` : `/tv/${r.id}`);
                        setShowDropdown(false);
                        setQuery("");
                        setSearchOpen(false);
                      }
                    }}
                    onBlur={() => setTimeout(() => { setShowDropdown(false); setSearchOpen(false); setQuery(""); }, 150)}
                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    placeholder="Tìm phim, TV show..."
                    autoFocus
                    className="w-64 pl-9 pr-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40 transition-all"
                  />

                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      {searchResults.map((result, index) => (
                        <Link
                          key={`${result.media_type}-${result.id}`}
                          href={result.media_type === "movie" ? `/movie/${result.id}` : `/tv/${result.id}`}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-colors",
                            selectedIndex === index ? "bg-white/10" : "hover:bg-white/5"
                          )}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setShowDropdown(false); setQuery(""); setSearchOpen(false); }}
                        >
                          <div className="relative w-8 h-12 shrink-0 rounded-lg overflow-hidden bg-white/10">
                            {result.poster_path && (
                              <Image
                                src={TMDB_IMG.poster(result.poster_path, "w185")}
                                alt={result.title ?? result.name ?? ""}
                                fill className="object-cover" sizes="32px"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-1">{result.title || result.name}</p>
                            <p className="text-white/40 text-xs">{result.media_type === "movie" ? "Phim" : "TV Show"}</p>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        className="block px-4 py-2.5 text-center text-white/50 hover:text-white text-xs border-t border-white/10 transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setShowDropdown(false); setQuery(""); setSearchOpen(false); }}
                      >
                        Xem tất cả kết quả →
                      </Link>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="size-4 text-white/70 hover:text-white" />
              </button>
            )}
          </div>

          {/* Dark / Light toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex size-9 rounded-full hover:bg-white/10 items-center justify-center transition-colors"
              aria-label="Đổi giao diện"
            >
              {theme === "dark"
                ? <Sun className="size-4 text-white/70" />
                : <Moon className="size-4 text-white/70" />
              }
            </button>
          )}

          {/* Watchlist */}
          <Link
            href="/watchlist"
            className={cn(
              "hidden md:flex size-9 rounded-full items-center justify-center transition-colors",
              pathname === "/watchlist" ? "bg-white/15" : "hover:bg-white/10"
            )}
            aria-label="Yêu thích"
          >
            <Bookmark className={cn("size-4 text-white/70", pathname === "/watchlist" && "fill-white text-white")} />
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden size-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="size-4 text-white" /> : <Menu className="size-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300", menuOpen ? "max-h-72" : "max-h-0")}>
        <div className="bg-[#0f0f0f]/98 backdrop-blur-md border-t border-white/8 px-6 py-4 flex flex-col gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm phim, TV show..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold shrink-0">
              Tìm
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/20"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Theme toggle mobile */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 transition-colors flex items-center gap-1.5"
              >
                {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {theme === "dark" ? "Sáng" : "Tối"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
