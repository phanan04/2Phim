import Image from "next/image";
import { TMDB_IMG } from "@/lib/constants";
import type { TMDBCast } from "@/types";

interface Props {
  cast: TMDBCast[];
}

export function CastCarousel({ cast }: Props) {
  if (!cast.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Diễn viên</h3>
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {cast.slice(0, 15).map((person) => (
          <div key={`${person.id}-${person.character}`} className="shrink-0 w-20 text-center">
            <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 mb-2 ring-2 ring-gray-300 dark:ring-white/10">
              {person.profile_path ? (
                <Image
                  src={TMDB_IMG.poster(person.profile_path, "w185")}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl select-none">
                  👤
                </div>
              )}
            </div>
            <p className="text-gray-900 dark:text-white text-xs font-medium line-clamp-1">{person.name}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1">{person.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
