import { Skeleton } from "@/components/ui/skeleton";

export default function GenreLoading() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-7 rounded bg-gray-800" />
            <Skeleton className="h-9 w-48 rounded bg-gray-800" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-full bg-gray-800" />
            <Skeleton className="h-8 w-20 rounded-full bg-gray-800" />
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-2/3 rounded-lg bg-gray-800" />
              <Skeleton className="h-4 w-3/4 rounded bg-gray-800" />
              <Skeleton className="h-3 w-1/2 rounded bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
