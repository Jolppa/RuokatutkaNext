interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-400"
      >
        Edellinen
      </button>
      <span className="px-4 py-2">
        Sivu {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 disabled:bg-gray-400"
      >
        Seuraava
      </button>
    </div>
  );
};

export default PaginationControls;
