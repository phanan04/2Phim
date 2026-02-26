import { Skeleton } from "@/components/ui/skeleton";

export default function TVLoading() {
  return (
    <div className="min-h-screen">
      <Skeleton className="w-full h-[55vh] md:h-[65vh] bg-white/5" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="shrink-0 w-44 md:w-60 aspect-[2/3] rounded-2xl bg-white/10 mx-auto md:mx-0" />

          <div className="flex-1 space-y-5 pt-2">
            <Skeleton className="h-12 w-3/4 bg-white/10 rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 bg-white/10 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-24 w-full bg-white/10 rounded-xl" />
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 bg-white/10 rounded-full" />
            ))}
          </div>
          <Skeleton className="w-full aspect-video rounded-2xl bg-white/8" />
        </div>
      </div>
    </div>
  );
}
