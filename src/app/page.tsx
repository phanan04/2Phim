import { HeroBanner } from "@/components/HeroBanner";
import { Section } from "@/components/HomeSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { GenreFilterSection } from "@/components/GenreFilterSection";
import { SetupBanner } from "@/components/SetupBanner";
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
      <main className="min-h-screen bg-[#0f0f0f]">
        {/* Hero — edge to edge, overlaps the fixed navbar */}
        {hero && (
          <HeroBanner items={trending.results.slice(0, 5)} type="movie" />
        )}

        {/* Content below hero */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10 space-y-12">
          {/* Recently viewed */}
          <RecentlyViewedSection />

          {/* Trending movies */}
          <Section
            title="🔥 Phim Thịnh Hành"
            movies={trending.results.slice(1, 21)}
            viewAllHref="/movies"
          />

          {/* Genre filter + browse section */}
          <GenreFilterSection
            movies={popular.results.slice(0, 30)}
            shows={popularTV.results.slice(0, 20)}
          />

          {/* TV Shows */}
          <Section
            title="📺 TV Show Nổi Bật"
            shows={trendingTV.results.slice(0, 20)}
            viewAllHref="/tv"
          />

          {/* Top rated */}
          <Section
            title="⭐ Đánh Giá Cao Nhất"
            movies={topRated.results.slice(0, 20)}
            viewAllHref="/movies"
          />

          {/* Now playing */}
          <Section
            title="🎬 Đang Chiếu Rạp"
            movies={nowPlaying.results.slice(0, 20)}
            viewAllHref="/movies"
          />

          {/* Popular TV */}
          <Section
            title="📺 TV Show Phổ Biến"
            shows={popularTV.results.slice(0, 20)}
            viewAllHref="/tv"
          />

          {/* Upcoming */}
          <Section
            title="📅 Sắp Ra Mắt"
            movies={upcoming.results.slice(0, 20)}
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
