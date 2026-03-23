import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const siblingCount = 1; 

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(
        currentPage + siblingCount,
        totalPages,
      );

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (showLeftDots && !showRightDots) {
        pages.push(1, "...");
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 py-6 flex justify-center items-center border-t border-slate-100">
      <div className="flex items-center gap-4 sm:gap-8">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-purple-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <div className="p-2 rounded-full border border-transparent group-hover:border-purple-100 group-hover:bg-purple-50 transition-all">
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="w-10 h-10 flex items-center justify-center text-slate-300"
                >
                  ...
                </span>
              );
            }

            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110 z-10"
                    : "text-slate-500 hover:bg-white hover:text-purple-600 hover:shadow-sm"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-purple-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <span className="hidden sm:inline">Next</span>
          <div className="p-2 rounded-full border border-transparent group-hover:border-purple-100 group-hover:bg-purple-50 transition-all">
            <ChevronRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
