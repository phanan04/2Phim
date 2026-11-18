import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-[#151D2A] border border-white/5 animate-pulse">
      <div className="relative aspect-[2/3] w-full bg-[#1A2436]" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#1A2436] rounded w-3/4" />
        <div className="h-3 bg-[#1A2436] rounded w-1/2" />
        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
          <div className="h-3 bg-[#1A2436] rounded w-10" />
          <div className="h-4 bg-[#1A2436] rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonRow: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
