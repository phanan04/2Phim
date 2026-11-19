import React, { useEffect, useState } from 'react';
import { phimApi, TOPIC_RIBBONS } from '../api/phimApi';
import { MovieItem } from '../types/movie';
import { HeroSlider } from '../components/common/HeroSlider';
import { TopTenCarousel } from '../components/common/TopTenCarousel';
import { MovieCarousel } from '../components/common/MovieCarousel';
import { LandscapeCarousel } from '../components/common/LandscapeCarousel';
import { SkeletonRow } from '../components/common/SkeletonCard';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Play } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import useEmblaCarousel from 'embla-carousel-react';

export const HomePage: React.FC = () => {
  const [newMovies, setNewMovies] = useState<MovieItem[]>([]);
  const [theaters, setTheaters] = useState<MovieItem[]>([]);
  const [kdrama, setKdrama] = useState<MovieItem[]>([]);
  const [chineseMovies, setChineseMovies] = useState<MovieItem[]>([]);
  const [westernMovies, setWesternMovies] = useState<MovieItem[]>([]);
  const [series, setSeries] = useState<MovieItem[]>([]);
  const [singles, setSingles] = useState<MovieItem[]>([]);
  const [animes, setAnimes] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRibbon, setActiveRibbon] = useState('all');
  const [ribbonRef] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      setLoading(true);
      try {
        const [
          resNew,
          resTheaters,
          resKdrama,
          resChina,
          resWestern,
          resSeries,
          resSingles,
          resAnimes,
        ] = await Promise.allSettled([
          phimApi.getNewUpdates(1),
          phimApi.getMoviesByType('phim-chieu-rap', 1, 16),
          phimApi.getMoviesByCountry('han-quoc', 1, 16),
          phimApi.getMoviesByCountry('trung-quoc', 1, 16),
          phimApi.getMoviesByCountry('au-my', 1, 16),
          phimApi.getMoviesByType('phim-bo', 1, 16),
          phimApi.getMoviesByType('phim-le', 1, 16),
          phimApi.getMoviesByType('hoat-hinh', 1, 16),
        ]);

        if (!isMounted) return;

        if (resNew.status === 'fulfilled') setNewMovies(resNew.value.items);
        if (resTheaters.status === 'fulfilled') setTheaters(resTheaters.value.items);
        if (resKdrama.status === 'fulfilled') setKdrama(resKdrama.value.items);
        if (resChina.status === 'fulfilled') setChineseMovies(resChina.value.items);
        if (resWestern.status === 'fulfilled') setWesternMovies(resWestern.value.items);
        if (resSeries.status === 'fulfilled') setSeries(resSeries.value.items);
        if (resSingles.status === 'fulfilled') setSingles(resSingles.value.items);
        if (resAnimes.status === 'fulfilled') setAnimes(resAnimes.value.items);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. HERO BILLBOARD BANNER (Full-Bleed 100vw, Touch Responsive) */}
      {loading ? (
        <div className="w-full h-[480px] sm:h-[620px] md:h-[720px] bg-[#141418] animate-pulse" />
      ) : (
        <HeroSlider movies={newMovies} />
      )}

      {/* CONTAINER FOR ALL ROWS & CONTENT */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 space-y-10 mt-4 sm:mt-6 relative z-20">
        {/* 2. CHỢ PHIM TOPIC PILLS (Bạn đang quan tâm gì?) */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/60">
            <Compass className="w-4 h-4 text-white/80" />
            <span>Khám phá chủ đề</span>
          </div>

          <div
            ref={ribbonRef}
            className="overflow-hidden py-1 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2.5 touch-pan-y">
              {TOPIC_RIBBONS.map((item) => {
                const isActive = activeRibbon === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setActiveRibbon(item.id)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'liquid-cta-primary shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-105'
                        : 'liquid-pill text-white/80 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. TOP 10 PHIM THỊNH HÀNH HÔM NAY (Xếp theo độ hot/lượt xem cao nhất) */}
        {!loading && theaters.length > 0 && (
          <TopTenCarousel movies={theaters} />
        )}

        {/* 4. MỚI LÊN SÓNG HÔM NAY (Xếp theo thời gian cập nhật tập mới nhất - Landscape 16:9 Cards) */}
        {loading ? (
          <SkeletonRow count={4} />
        ) : (
          <LandscapeCarousel
            title="Mới Lên Sóng Hôm Nay"
            movies={newMovies}
            viewAllLink="/kham-pha"
          />
        )}

        {/* 5. K-DRAMA & PHIM HÀN QUỐC MỚI (Chuẩn Chợ Phim - Poster 2:3 Cards) */}
        {loading ? (
          <SkeletonRow count={6} />
        ) : (
          <MovieCarousel
            title="K-Drama Hàn Quốc Mới"
            movies={kdrama.length > 0 ? kdrama : series}
            viewAllLink="/kham-pha?country=han-quoc"
          />
        )}

        {/* 6. CỔ TRANG & PHIM TRUNG QUỐC MỚI (Chuẩn Chợ Phim - Landscape 16:9 Cards) */}
        {loading ? (
          <SkeletonRow count={4} />
        ) : (
          <LandscapeCarousel
            title="Cổ Trang & Phim Trung Quốc Mới"
            movies={chineseMovies.length > 0 ? chineseMovies : series}
            viewAllLink="/kham-pha?country=trung-quoc"
          />
        )}

        {/* 6.5. EXCLUSIVE SPOTLIGHT BANNER */}
        {!loading && theaters.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden liquid-card my-8">
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden">
              <img
                src={getImageUrl(theaters[0].thumb_url || theaters[0].poster_url)}
                alt={theaters[0].name}
                className="w-full h-full object-cover object-center filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

              <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-center max-w-2xl space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-white text-[#070709] text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" /> ĐỀ XUẤT ĐẶC BIỆT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                    T16
                  </span>
                  {theaters[0].quality && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                      {theaters[0].quality}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-lg">
                  {theaters[0].name}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {theaters[0].origin_name} ({theaters[0].year || '2026'}). Trải nghiệm tuyệt tác điện ảnh tốc độ cao với chất lượng hình ảnh sắc nét và phụ đề đầy đủ, độc quyền tại 2Phim.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={`/phim/${theaters[0].slug}`}
                    className="px-6 sm:px-8 py-3 rounded-full liquid-cta-primary font-black text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current text-black" />
                    <span>Xem Phim Ngay</span>
                  </Link>
                  <Link
                    to={`/phim/${theaters[0].slug}`}
                    className="px-5 sm:px-6 py-3 rounded-full liquid-pill text-white text-xs sm:text-sm font-bold flex items-center gap-1.5"
                  >
                    <span>Chi Tiết</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. BOM TẤN CHIẾU RẠP (Poster 2:3 Cards) */}
        {loading ? (
          <SkeletonRow count={6} />
        ) : (
          <MovieCarousel
            title="Bom Tấn Chiếu Rạp Mới Coóng"
            movies={theaters}
            viewAllLink="/kham-pha?type=phim-chieu-rap"
          />
        )}

        {/* 8. PHIM ÂU MỸ & HOLLYWOOD MỚI (Chuẩn Chợ Phim - Poster 2:3 Cards) */}
        {loading ? (
          <SkeletonRow count={6} />
        ) : (
          <MovieCarousel
            title="Phim Âu Mỹ & Hollywood Mới"
            movies={westernMovies.length > 0 ? westernMovies : singles}
            viewAllLink="/kham-pha?country=au-my"
          />
        )}

        {/* 9. THẾ GIỚI ANIME & HOẠT HÌNH (Landscape 16:9 Cards) */}
        {loading ? (
          <SkeletonRow count={4} />
        ) : (
          <LandscapeCarousel
            title="Thế Giới Anime & Hoạt Hình"
            movies={animes}
            viewAllLink="/kham-pha?type=hoat-hinh"
          />
        )}

        {/* 10. PHIM LẺ ĐỈNH CAO (Poster 2:3 Cards) */}
        {loading ? (
          <SkeletonRow count={6} />
        ) : (
          <MovieCarousel
            title="Phim Lẻ Đỉnh Cao"
            movies={singles}
            viewAllLink="/kham-pha?type=phim-le"
          />
        )}

        {/* 11. PHIM BỘ TUYỂN CHỌN MỚI CẬP NHẬT */}
        {loading ? (
          <SkeletonRow count={6} />
        ) : (
          <MovieCarousel
            title="Phim Bộ Tuyển Chọn Mới Cập Nhật"
            movies={series}
            viewAllLink="/kham-pha?type=phim-bo"
          />
        )}

        {/* 12. CATEGORY HUBS */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase">
                Khám Phá Theo Chủ Đề
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: 'Chiếu Rạp', path: '/kham-pha?type=phim-chieu-rap', icon: '🎬', gradient: 'from-amber-600/30 to-yellow-600/10' },
              { name: 'K-Drama Hàn', path: '/kham-pha?country=han-quoc', icon: '🇰🇷', gradient: 'from-rose-600/30 to-pink-600/10' },
              { name: 'Cổ Trang Trung', path: '/kham-pha?country=trung-quoc', icon: '🏯', gradient: 'from-red-600/30 to-orange-600/10' },
              { name: 'Bom Tấn Âu Mỹ', path: '/kham-pha?country=au-my', icon: '🇺🇸', gradient: 'from-blue-600/30 to-indigo-600/10' },
              { name: 'Anime Nhật Bản', path: '/kham-pha?type=hoat-hinh', icon: '🎌', gradient: 'from-purple-600/30 to-violet-600/10' },
              { name: 'Phim Bộ Hot', path: '/kham-pha?type=phim-bo', icon: '📺', gradient: 'from-emerald-600/30 to-teal-600/10' },
            ].map((hub) => (
              <Link
                key={hub.name}
                to={hub.path}
                className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${hub.gradient} border border-white/10 hover:border-white/40 transition-all hover:scale-105 hover:shadow-[0_10px_25px_rgba(255,255,255,0.15)] flex flex-col items-center text-center space-y-2 group liquid-glass`}
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{hub.icon}</span>
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-white transition-colors">
                  {hub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
