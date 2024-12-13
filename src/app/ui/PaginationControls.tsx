import React from "react";

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
    <nav
      className="flex gap-2"
      role="navigation"
      aria-label="Tulos-sivunavigointi"
    >
      <button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-[#4F6169] rounded-lg text-white hover:bg-[#7B898E] disabled:bg-gray-400"
        aria-label="Edellinen sivu"
      >
        Edellinen
      </button>
      <span className="px-4 py-2" aria-live="polite" aria-atomic="true">
        Sivu {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-[#4F6169] rounded-lg text-white hover:bg-[#7B898E] disabled:bg-gray-400"
        aria-label="Seuraava sivu"
      >
        Seuraava
      </button>
    </nav>
  );
};

export default PaginationControls;
