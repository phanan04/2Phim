import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-10 flex-wrap">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 rounded-full bg-[#18181C] border border-white/10 text-white/80 hover:bg-[#FECF59] hover:text-black hover:border-[#FECF59] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs sm:text-sm font-bold"
      >
        <ChevronLeft className="w-4 h-4" /> Trước
      </button>

      {/* Pages */}
      {getPageNumbers().map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`dots-${idx}`} className="px-2 py-1 text-white/40 text-sm">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(Number(page))}
            className={`min-w-[40px] h-[40px] rounded-full text-xs sm:text-sm font-black transition-all ${
              isCurrent
                ? 'bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 text-black shadow-md scale-105'
                : 'bg-[#18181C] border border-white/10 text-white/80 hover:border-[#FECF59] hover:text-[#FECF59]'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 rounded-full bg-[#18181C] border border-white/10 text-white/80 hover:bg-[#FECF59] hover:text-black hover:border-[#FECF59] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs sm:text-sm font-bold"
      >
        Sau <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
