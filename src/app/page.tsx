import dynamic from "next/dynamic";
import { HeroBanner } from "@/components/HeroBanner";
import { SetupBanner } from "@/components/SetupBanner";

// Dynamically import client components below the fold to defer hydration JS and reduce initial bundle size
const Section = dynamic(() => import("@/components/HomeSection").then((mod) => mod.Section));
const RecentlyViewedSection = dynamic(() => import("@/components/RecentlyViewedSection").then((mod) => mod.RecentlyViewedSection));
const GenreFilterSection = dynamic(() => import("@/components/GenreFilterSection").then((mod) => mod.GenreFilterSection));

import {
  getTrendingMovies,
  getTrendingTV,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  TMDBConfigError,
} from "@/lib/tmdb";
import { TMDB_IMG } from "@/lib/constants";

export const revalidate = 3600;

export default async function HomePage() {
  try {
    const [trending, trendingTV, popular, topRated, popularTV, nowPlaying, upcoming] =
      await Promise.all([
        getTrendingMovies(),
        getTrendingTV(),
        getPopularMovies(),
        getTopRatedMovies(),
        getPopularTV(),
        getNowPlayingMovies(),
        getUpcomingMovies(),
      ]);

    const hero = trending.results[0];
    return (
      <main className="min-h-screen">

        {/* Hero — edge to edge, overlaps the fixed navbar */}
        {hero && (
          <HeroBanner items={trending.results.slice(0, 5)} type="movie" />
        )}

        {/* Content below hero */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10 space-y-12">
          {/* Recently viewed */}
          <RecentlyViewedSection />

          {/* Now playing - Nóng nhất ngoài rạp lên trên cùng */}
          <Section
            title="Đang Chiếu Rạp"
            movies={nowPlaying.results.slice(0, 20)}
            viewAllHref="/movies"
          />

          {/* Trending movies */}
          <Section
            title="Phim Thịnh Hành"
            movies={trending.results.slice(1, 21)}
            viewAllHref="/movies"
          />

          {/* TV Shows */}
          <Section
            title="TV Show Nổi Bật"
            shows={trendingTV.results.slice(0, 20)}
            viewAllHref="/tv"
          />

          {/* Sắp ra mắt - Dành cho người xem chờ đợi */}
          <Section
            title="Sắp Ra Mắt"
            movies={upcoming.results.slice(0, 20)}
            viewAllHref="/movies"
          />

          {/* Popular TV */}
          <Section
            title="TV Show Phổ Biến"
            shows={popularTV.results.slice(0, 20)}
            viewAllHref="/tv"
          />

          {/* Genre filter + browse section */}
          <GenreFilterSection
            movies={popular.results.slice(0, 30)}
            shows={popularTV.results.slice(0, 20)}
          />

          {/* Top rated - Hơi cũ nên để cuối */}
          <Section
            title="Tuyệt Tác Đánh Giá Cao"
            movies={topRated.results.slice(0, 20)}
            viewAllHref="/movies"
          />
        </div>
      </main>
    );
  } catch (e) {
    if (e instanceof TMDBConfigError) {
      return <SetupBanner />;
    }
    throw e;
  }
}
