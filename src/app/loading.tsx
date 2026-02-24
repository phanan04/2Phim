import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Hero skeleton */}
        <Skeleton className="w-full h-[60vh] md:h-[70vh] rounded-2xl bg-gray-800" />

        {/* Section skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-7 w-56 bg-gray-800 rounded" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton
                  key={j}
                  className="shrink-0 w-36 sm:w-44 aspect-2/3 rounded-lg bg-gray-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
