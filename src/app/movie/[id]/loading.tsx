import { Skeleton } from "@/components/ui/skeleton";

export default function MovieLoading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Backdrop */}
      <Skeleton className="w-full h-[50vh] md:h-[60vh] bg-gray-800" />

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <Skeleton className="shrink-0 w-48 md:w-64 aspect-2/3 rounded-xl bg-gray-800 mx-auto md:mx-0" />

          {/* Info */}
          <div className="flex-1 space-y-4 pt-2">
            <Skeleton className="h-10 w-3/4 bg-gray-800 rounded" />
            <Skeleton className="h-5 w-1/3 bg-gray-800 rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 bg-gray-800 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-24 w-full bg-gray-800 rounded" />
          </div>
        </div>

        {/* Player skeleton */}
        <Skeleton className="mt-8 w-full aspect-video rounded-xl bg-gray-800" />
      </div>
    </div>
  );
}
