import { HeroBanner } from "@/components/HeroBanner";
import { Section } from "@/components/HomeSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";

export const revalidate = 3600; // ISR: rebuild at most once per hour
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

export default async function HomePage() {
  try {
    const [trending, trendingTV, popular, topRated, popularTV, nowPlaying, upcoming] = await Promise.all([
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
      <main className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 space-y-10">
          {hero && <HeroBanner items={trending.results.slice(0, 5)} type="movie" />}
          <RecentlyViewedSection />
          <Section title="🔥 Phim Thịnh Hành" movies={trending.results.slice(1, 21)} viewAllHref="/movies" />
          <Section title="📺 TV Show Nổi Bật" shows={trendingTV.results.slice(0, 20)} viewAllHref="/tv" />
          <Section title="🎬 Phim Phổ Biến" movies={popular.results.slice(0, 20)} viewAllHref="/movies" />
          <Section title="⭐ Phim Đánh Giá Cao" movies={topRated.results.slice(0, 20)} viewAllHref="/movies" />
          <Section title="📺 TV Show Phổ Biến" shows={popularTV.results.slice(0, 20)} viewAllHref="/tv" />
          <Section title="🎬 Đang Chiếu Rạp" movies={nowPlaying.results.slice(0, 20)} viewAllHref="/movies" />
          <Section title="📅 Sắp Ra Mắt" movies={upcoming.results.slice(0, 20)} viewAllHref="/movies" />
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


