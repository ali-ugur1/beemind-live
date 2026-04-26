import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const showStartDots = startPage > 1;
  const showEndDots = endPage < totalPages;

  const baseBtn =
    "min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors flex items-center justify-center";
  const inactiveBtn = "bg-gray-800 text-gray-400 hover:bg-gray-700";
  const activeBtn = "bg-amber-500 text-black font-bold hover:bg-amber-400";
  const iconBtn =
    "h-10 w-10 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-6 flex-wrap"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={iconBtn}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* First page + start dots */}
      {showStartDots && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={`${baseBtn} ${inactiveBtn}`}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="px-2 text-gray-600 select-none">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => {
        const isActive = currentPage === page;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Page ${page}`}
            className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
          >
            {page}
          </button>
        );
      })}

      {/* End dots + last page */}
      {showEndDots && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-600 select-none">...</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={`${baseBtn} ${inactiveBtn}`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={iconBtn}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default Pagination;
