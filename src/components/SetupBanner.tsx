import { KeyRound, ExternalLink, Terminal, CheckCircle } from "lucide-react";

export function SetupBanner() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
              <KeyRound className="size-10 text-red-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Cần cấu hình API Key</h1>
          <p className="text-gray-400">
            Ứng dụng cần TMDB API Key để lấy thông tin phim và hình ảnh.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-white/10">
          <h2 className="font-semibold text-lg text-white">Hướng dẫn cài đặt</h2>

          <ol className="space-y-4">
            <Step number={1}>
              Truy cập{" "}
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 underline underline-offset-2"
              >
                themoviedb.org/settings/api
                <ExternalLink className="size-3" />
              </a>{" "}
              và đăng ký tài khoản miễn phí để lấy API Key (v3).
            </Step>

            <Step number={2}>
              Mở file{" "}
              <code className="bg-black/40 text-green-400 px-2 py-0.5 rounded text-sm font-mono">
                .env.local
              </code>{" "}
              trong thư mục gốc của project.
            </Step>

            <Step number={3}>
              Thay{" "}
              <code className="bg-black/40 text-yellow-400 px-2 py-0.5 rounded text-sm font-mono">
                your_tmdb_api_key_here
              </code>{" "}
              bằng API Key thực của bạn:
            </Step>
          </ol>

          {/* Code block */}
          <div className="bg-black rounded-xl p-4 font-mono text-sm border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs">
              <Terminal className="size-3.5" />
              .env.local
            </div>
            <p className="text-gray-400">
              # Get your free API key at themoviedb.org
            </p>
            <p>
              <span className="text-blue-400">TMDB_API_KEY</span>
              <span className="text-white">=</span>
              <span className="text-green-400">abc123yourkeyhere</span>
            </p>
          </div>

          <Step number={4} last>
            Khởi động lại dev server:{" "}
            <code className="bg-black/40 text-green-400 px-2 py-0.5 rounded text-sm font-mono">
              npm run dev
            </code>
          </Step>
        </div>

        <p className="text-center text-gray-500 text-sm">
          TMDB API hoàn toàn miễn phí •{" "}
          <a
            href="https://developer.themoviedb.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300"
          >
            Xem tài liệu
          </a>
        </p>
      </div>
    </main>
  );
}

function Step({
  number,
  children,
  last,
}: {
  number: number;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className={`flex gap-3 ${!last ? "pb-4 border-b border-white/5" : ""}`}>
      <div className="shrink-0 flex items-center justify-center size-6 rounded-full bg-red-600 text-white text-xs font-bold mt-0.5">
        {number}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{children}</p>
    </li>
  );
}
