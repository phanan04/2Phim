# 🎬 2Phim — Xem Phim & TV Show Online Miễn Phí

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

> Trang web xem phim và TV show miễn phí, chất lượng cao — sử dụng TMDB API + nhiều nguồn stream.

**Repo:** [github.com/phanan04/2Phim](https://github.com/phanan04/2Phim)

---

## ✨ Tính năng

### 🎥 Xem phim
- **9 nguồn stream** — AutoEmbed (×4 server), VidSrc (×4 domain), 2Embed, VidLink
- Chuyển đổi server ngay trên trang khi một nguồn bị lỗi
- TV Show: chọn mùa & tập, **deep link** `/tv/[id]?s=2&ep=5`
- Tự động lưu tiến độ xem (continue watching)

### 🏠 Trang chủ
- Hero slideshow tự động cuộn (5 phim trending, 6 giây/slide)
- Sections: Thịnh Hành · TV Nổi Bật · Phổ Biến · Đánh Giá Cao · Đang Chiếu Rạp · Sắp Ra Mắt
- **Xem gần đây** — tự động lưu lịch sử, hiện ngay trên trang chủ

### 🔍 Tìm kiếm
- Live search dropdown với 300ms debounce + session cache
- Điều hướng bàn phím: `↑↓` chọn, `Enter` mở, `Esc` đóng
- Trang kết quả `/search?q=...`

### 📋 Danh sách & lịch sử
- **Yêu thích** — bookmark phim/TV, lưu localStorage, trang `/watchlist`
- **Xem gần đây** — tự động lưu khi vào trang chi tiết
- **Continue watching** — nhớ tập cuối xem cho từng TV show
- Toast notification khi thêm/xóa yêu thích

### 🎭 Thể loại & khám phá
- Trang `/genre/[id]` cho từng thể loại phim & TV show
- **Phân trang đầy đủ** (tối đa 500 trang từ TMDB)
- Badge thể loại click được ngay trên trang chi tiết

### 📄 Trang chi tiết
- Backdrop · Poster · Rating · Thể loại · Tóm tắt
- **CastCarousel** — danh sách diễn viên cuộn ngang
- **Trailer** — modal YouTube
- **Chia sẻ** — Web Share API hoặc copy clipboard
- **Breadcrumbs** — điều hướng dễ dàng
- Phim / TV Show tương tự

### 🌓 Giao diện
- **Dark / Light mode** — toggle, lưu preference
- Responsive hoàn toàn (mobile → desktop)
- Skeleton loading trên mọi trang danh sách
- Blur placeholder cho tất cả ảnh TMDB
- BackToTop button

---

## 🛠 Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| [Next.js](https://nextjs.org) | 16 (App Router) | Framework |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Styling |
| [shadcn/ui](https://ui.shadcn.com) | latest | UI components |
| [next-themes](https://github.com/pacocoursey/next-themes) | latest | Dark/Light mode |
| [sonner](https://sonner.emilkowal.ski) | latest | Toast notifications |
| [TMDB API](https://developer.themoviedb.org) | v3 | Dữ liệu phim |
| [Lucide React](https://lucide.dev) | latest | Icons |

---

## 🚀 Chạy local

### 1. Clone repo
```bash
git clone https://github.com/phanan04/2Phim.git
cd 2Phim
npm install
```

### 2. Tạo file `.env.local`
```env
TMDB_API_KEY=your_tmdb_api_key_here
```

> Lấy API key miễn phí tại [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 3. Chạy dev server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── page.tsx              # Trang chủ
│   ├── movie/[id]/           # Chi tiết phim
│   ├── tv/[id]/              # Chi tiết TV show
│   ├── movies/               # Danh sách phim (có phân trang)
│   ├── tv/                   # Danh sách TV show (có phân trang)
│   ├── genre/[id]/           # Theo thể loại (có phân trang)
│   ├── search/               # Kết quả tìm kiếm
│   ├── watchlist/            # Danh sách yêu thích
│   └── api/                  # API routes (TMDB proxy)
├── components/
│   ├── HeroBanner.tsx        # Hero slideshow
│   ├── MovieCard.tsx         # Card phim (server component)
│   ├── EpisodeSelector.tsx   # Chọn mùa/tập TV show
│   ├── VideoPlayer.tsx       # Player với 9 server
│   ├── Navbar.tsx            # Navbar + live search + keyboard nav
│   ├── ShareButton.tsx       # Nút chia sẻ
│   ├── Breadcrumb.tsx        # Breadcrumb navigation
│   ├── RecentlyViewedSection.tsx  # Lịch sử xem trên trang chủ
│   ├── TrackView.tsx         # Client component tự động lưu lịch sử
│   └── ...
├── hooks/
│   ├── useWatchlist.ts       # Quản lý yêu thích
│   ├── useRecentlyViewed.ts  # Lịch sử xem gần đây
│   └── useContinueWatching.ts # Tiếp tục xem TV show
├── lib/
│   ├── tmdb.ts               # TMDB API helpers
│   ├── constants.ts          # URL builders, blur placeholder
│   └── utils.ts
└── types/
    └── index.ts              # TypeScript types
```

---

## 📝 License

MIT — tự do sử dụng, học tập và đóng góp.
