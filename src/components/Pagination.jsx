import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Sayfa numaralarını oluştur (max 5 sayfa göster)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[40px] px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === page
              ? 'bg-amber-500 text-black font-bold'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Dots if there are more pages */}
      {endPage < totalPages && (
        <span className="px-2 text-gray-600">...</span>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
