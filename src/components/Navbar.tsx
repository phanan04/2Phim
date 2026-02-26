"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { Film, Tv, Search, Menu, X, Bookmark, Bell } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track scroll to change navbar bg
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setMenuOpen(false);
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
        } catch {
          /* ignore */
        }
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
          ? "bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5 shadow-xl shadow-black/30"
          : "bg-gradient-to-b from-black/70 to-transparent"
      )}
    >
      <div className="max-w-[1600px] mx-auto flex h-16 items-center gap-6 px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="size-8 rounded-lg bg-white flex items-center justify-center font-black text-black text-lg leading-none select-none group-hover:bg-white/90 transition-colors">
            2
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            Phim
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowDropdown(false);
                        setSearchOpen(false);
                        setSelectedIndex(-1);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedIndex((prev) =>
                          Math.min(prev + 1, searchResults.length - 1)
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedIndex((prev) => Math.max(prev - 1, -1));
                      } else if (
                        e.key === "Enter" &&
                        selectedIndex >= 0 &&
                        searchResults[selectedIndex]
                      ) {
                        e.preventDefault();
                        const r = searchResults[selectedIndex];
                        router.push(
                          r.media_type === "movie"
                            ? `/movie/${r.id}`
                            : `/tv/${r.id}`
                        );
                        setShowDropdown(false);
                        setQuery("");
                        setSearchOpen(false);
                      }
                    }}
                    onBlur={() =>
                      setTimeout(() => {
                        setShowDropdown(false);
                        setSearchOpen(false);
                        setQuery("");
                      }, 150)
                    }
                    placeholder="Tìm phim, TV show..."
                    autoFocus
                    className="w-72 pl-9 pr-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  />

                  {/* Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      {searchResults.map((result, index) => (
                        <Link
                          key={`${result.media_type}-${result.id}`}
                          href={
                            result.media_type === "movie"
                              ? `/movie/${result.id}`
                              : `/tv/${result.id}`
                          }
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-colors",
                            selectedIndex === index
                              ? "bg-white/10"
                              : "hover:bg-white/5"
                          )}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setShowDropdown(false);
                            setQuery("");
                            setSearchOpen(false);
                          }}
                        >
                          <div className="relative w-8 h-12 shrink-0 rounded-lg overflow-hidden bg-white/10">
                            {result.poster_path && (
                              <Image
                                src={TMDB_IMG.poster(result.poster_path, "w185")}
                                alt={result.title ?? result.name ?? ""}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-1">
                              {result.title || result.name}
                            </p>
                            <p className="text-white/40 text-xs">
                              {result.media_type === "movie" ? "Phim" : "TV Show"}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        className="block px-4 py-2.5 text-center text-white/50 hover:text-white text-xs border-t border-white/10 transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setShowDropdown(false);
                          setQuery("");
                          setSearchOpen(false);
                        }}
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
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Search className="size-4 text-white" />
              </button>
            )}
          </div>

          {/* Notification bell */}
          <button className="hidden md:flex size-9 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-colors">
            <Bell className="size-4 text-white" />
          </button>

          {/* Watchlist */}
          <Link
            href="/watchlist"
            className="hidden md:flex size-9 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
          >
            <Bookmark className="size-4 text-white" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="size-4 text-white" />
            ) : (
              <Menu className="size-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="bg-[#0f0f0f]/98 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm phim, TV show..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold"
            >
              Tìm
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium hover:bg-white/20 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
