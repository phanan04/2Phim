import { WatchlistView } from "@/components/WatchlistView";

export const metadata = {
  title: "Danh sách của tôi — 2Phim",
  description: "Danh sách phim và TV show yêu thích của bạn",
};

export default function WatchlistPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white pt-24">
      <WatchlistView />
    </main>
  );
}
