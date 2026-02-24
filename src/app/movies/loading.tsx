import { Skeleton } from "@/components/ui/skeleton";

export default function MoviesLoading() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 bg-gray-800 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-2/3 rounded-lg bg-gray-800" />
              <Skeleton className="h-4 w-3/4 bg-gray-800 rounded" />
              <Skeleton className="h-3 w-1/2 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
