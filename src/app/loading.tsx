import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      {/* Hero skeleton */}
      <Skeleton className="w-full h-screen max-h-[720px] bg-white/5" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10 space-y-12">
        {/* Section skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48 bg-white/8 rounded-lg" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton
                  key={j}
                  className="shrink-0 w-[160px] aspect-[2/3] rounded-xl bg-white/8"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
