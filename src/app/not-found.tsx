import Link from "next/link";
import { Film, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Big 404 */}
        <div className="relative">
          <p className="text-[8rem] md:text-[12rem] font-black text-white/5 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="size-20 text-red-500 opacity-80" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Trang không tồn tại</h1>
          <p className="text-gray-400">
            Phim hoặc trang bạn tìm kiếm đã bị xóa hoặc không tồn tại.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 gap-2 w-full sm:w-auto">
              <Home className="size-4" /> Về trang chủ
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
              <Search className="size-4" /> Tìm kiếm phim
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
