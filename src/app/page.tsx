import { HeroBanner } from "@/components/HeroBanner";
import { Section } from "@/components/HomeSection";

export const revalidate = 3600; // ISR: rebuild at most once per hour
import { SetupBanner } from "@/components/SetupBanner";
import {
  getTrendingMovies,
  getTrendingTV,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  TMDBConfigError,
} from "@/lib/tmdb";

export default async function HomePage() {
  try {
    const [trending, trendingTV, popular, topRated, popularTV] = await Promise.all([
      getTrendingMovies(),
      getTrendingTV(),
      getPopularMovies(),
      getTopRatedMovies(),
      getPopularTV(),
    ]);

    const hero = trending.results[0];

    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8 space-y-10">
          {hero && <HeroBanner items={trending.results.slice(0, 5)} type="movie" />}
          <Section title="🔥 Phim Thịnh Hành" movies={trending.results.slice(1, 21)} viewAllHref="/movies" />
          <Section title="📺 TV Show Nổi Bật" shows={trendingTV.results.slice(0, 20)} viewAllHref="/tv" />
          <Section title="🎬 Phim Phổ Biến" movies={popular.results.slice(0, 20)} viewAllHref="/movies" />
          <Section title="⭐ Phim Đánh Giá Cao" movies={topRated.results.slice(0, 20)} viewAllHref="/movies" />
          <Section title="📺 TV Show Phổ Biến" shows={popularTV.results.slice(0, 20)} viewAllHref="/tv" />
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


