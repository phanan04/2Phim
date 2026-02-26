import Link from "next/link";
import { Film, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Big 404 */}
        <div className="relative">
          <p className="text-[10rem] md:text-[14rem] font-black text-white/5 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="size-20 text-red-500 opacity-70" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold">Trang không tồn tại</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Phim hoặc trang bạn tìm kiếm đã bị xóa hoặc không tồn tại.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <button className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white/90 transition-colors w-full sm:w-auto justify-center">
              <Home className="size-4" /> Về trang chủ
            </button>
          </Link>
          <Link href="/search">
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white/20 transition-colors w-full sm:w-auto justify-center">
              <Search className="size-4" /> Tìm kiếm phim
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
