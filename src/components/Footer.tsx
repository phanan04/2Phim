import Link from "next/link";
import { Film, Github, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/60 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white w-fit">
              <Film className="size-5 text-red-500" />
              <span>
                <span className="text-red-500">2</span>Phim
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Xem phim và TV show miễn phí, chất lượng cao. Dữ liệu phim cung cấp bởi{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                TMDB
              </a>
              .
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Khám phá</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Trang chủ" },
                { href: "/movies", label: "Phim lẻ" },
                { href: "/tv", label: "TV Show" },
                { href: "/search", label: "Tìm kiếm" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Powered by */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Nguồn phim</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="https://player.autoembed.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  AutoEmbed
                </a>
              </li>
              <li>
                <a
                  href="https://www.2embed.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  2Embed
                </a>
              </li>
              <li>
                <a
                  href="https://vidlink.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  VidLink
                </a>
              </li>
              <li>
                <a
                  href="https://vidsrc.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  VidSrc
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {year} 2Phim. Website chỉ dùng cho mục đích học tập.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/phanan04/2Phim"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              Made with <Heart className="size-3 text-red-500 fill-red-500" /> bằng Next.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
