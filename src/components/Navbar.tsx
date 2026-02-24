"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Film, Tv, Search, Menu, X, Bookmark, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TMDB_IMG } from "@/lib/constants";

// Module-level cache so it persists across re-renders (session lifetime)
type SearchResult = { id: number; media_type: string; poster_path: string | null; title?: string; name?: string };
const searchCache = new Map<string, SearchResult[]>();

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setMenuOpen(false);
        setShowDropdown(false);
      }
    },
    [query, router]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Check cache first
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
        setShowDropdown(true);
      } catch { /* ignore */ }
    }, 300);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white shrink-0">
          <Film className="size-6 text-red-500" />
          <span className="hidden sm:inline">
            <span className="text-red-500">2</span>Phim
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link href="/movies">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white gap-1.5">
              <Film className="size-4" /> Phim
            </Button>
          </Link>
          <Link href="/tv">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white gap-1.5">
              <Tv className="size-4" /> TV Show
            </Button>
          </Link>
          <Link href="/watchlist">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white gap-1.5">
              <Bookmark className="size-4" /> Yêu thích
            </Button>
          </Link>
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md ml-auto hidden md:flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Tìm phim, TV show..."
              className="pl-9 bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-red-500"
            />
            {/* Live search dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.media_type}-${result.id}`}
                    href={result.media_type === "movie" ? `/movie/${result.id}` : `/tv/${result.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setShowDropdown(false); setQuery(""); }}
                  >
                      <div className="relative w-8 h-12 shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-800">
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
                      <p className="text-gray-900 dark:text-white text-sm font-medium line-clamp-1">
                        {result.title || result.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {result.media_type === "movie" ? "Phim" : "TV Show"}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block px-3 py-2.5 text-center text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs border-t border-gray-100 dark:border-white/10 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setShowDropdown(false); setQuery(""); }}
                >
                  Xem tất cả kết quả →
                </Link>
              </div>
            )}
          </div>
          <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 shrink-0">
            Tìm
          </Button>
        </form>

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        )}

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto text-gray-900 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-48" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 pb-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm phim, TV show..."
                className="pl-9 bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700">
              Tìm
            </Button>
          </form>
          <div className="flex gap-2 flex-wrap">
            <Link href="/movies" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 gap-1.5">
                <Film className="size-4" /> Phim
              </Button>
            </Link>
            <Link href="/tv" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 gap-1.5">
                <Tv className="size-4" /> TV Show
              </Button>
            </Link>
            <Link href="/watchlist" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 gap-1.5">
                <Bookmark className="size-4" /> Yêu thích
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
