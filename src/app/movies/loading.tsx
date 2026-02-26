import { Skeleton } from "@/components/ui/skeleton";

export default function MoviesLoading() {
  return (
    <main className="min-h-screen pt-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-16">
        <Skeleton className="h-8 w-52 bg-white/8 rounded-lg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="w-full aspect-[2/3] rounded-xl bg-white/8" />
              <Skeleton className="h-3.5 w-3/4 bg-white/8 rounded" />
              <Skeleton className="h-3 w-1/2 bg-white/8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
