import Image from "next/image";
import { TMDB_IMG, TMDB_BLUR_PLACEHOLDER } from "@/lib/constants";
import type { TMDBCast } from "@/types";

interface Props {
  cast: TMDBCast[];
}

export function CastCarousel({ cast }: Props) {
  if (!cast.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Điễn viên</h3>
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {cast.slice(0, 15).map((person) => (
          <div key={`${person.id}-${person.character}`} className="shrink-0 w-20 text-center">
            <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 mb-2.5 ring-2 ring-gray-200 dark:ring-white/10">
              {person.profile_path ? (
                <Image
                  src={TMDB_IMG.poster(person.profile_path, "w185")}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  placeholder="blur"
                  blurDataURL={TMDB_BLUR_PLACEHOLDER}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/30 text-xl select-none">
                  👤
                </div>
              )}
            </div>
            <p className="text-gray-900 dark:text-white text-xs font-medium line-clamp-1">{person.name}</p>
            <p className="text-gray-500 dark:text-white/40 text-xs line-clamp-1">{person.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
