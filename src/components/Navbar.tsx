"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { Film, Tv, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setMenuOpen(false);
      }
    },
    [query, router]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white shrink-0">
          <Film className="size-6 text-red-500" />
          <span className="hidden sm:inline">
            <span className="text-red-500">Cine</span>Stream
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link href="/movies">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white gap-1.5">
              <Film className="size-4" /> Phim
            </Button>
          </Link>
          <Link href="/tv">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white gap-1.5">
              <Tv className="size-4" /> TV Show
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm phim, TV show..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-red-500"
            />
          </div>
          <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 shrink-0">
            Tìm
          </Button>
        </form>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto text-white"
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
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700">
              Tìm
            </Button>
          </form>
          <div className="flex gap-2">
            <Link href="/movies" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="text-gray-300 gap-1.5">
                <Film className="size-4" /> Phim
              </Button>
            </Link>
            <Link href="/tv" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="text-gray-300 gap-1.5">
                <Tv className="size-4" /> TV Show
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
