import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { href: "/", label: "Trang chủ" },
    { href: "/movies", label: "Phim" },
    { href: "/tv", label: "TV Show" },
    { href: "/search", label: "Tìm kiếm" },
    { href: "/watchlist", label: "Yêu thích" },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-white/8 bg-white dark:bg-[#0a0a0a] mt-16">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="space-y-2.5">
            <Link href="/" className="flex items-center gap-2 w-fit group">
              <div className="size-7 rounded-md bg-gray-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-base leading-none">
                2
              </div>
              <span className="font-extrabold text-lg text-gray-950 dark:text-white tracking-tight">Phim</span>
            </Link>
            <p className="text-gray-500 dark:text-white/40 text-xs leading-relaxed max-w-xs">
              Xem phim & TV show miễn phí. Dữ liệu cung cấp bởi{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-white/60 hover:text-gray-950 dark:hover:text-white transition-colors underline underline-offset-2"
              >
                TMDB
              </a>
              .
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 dark:text-white/30 text-xs">
            © {year} 2Phim — Chỉ dùng cho mục đích học tập.
          </p>
          <a
            href="https://github.com/phanan04/2Phim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white text-xs transition-colors"
          >
            <Github className="size-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
