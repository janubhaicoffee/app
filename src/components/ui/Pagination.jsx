"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange, showTotal = false, className = "" }) {
  if (totalPages <= 1) return null;

  function getPageNumbers() {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  const btnBase = "inline-flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-semibold rounded-lg transition-all duration-150";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnBase} text-[var(--text-secondary)] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-gray-400 select-none">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === page
                ? "bg-[var(--primary-color)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnBase} text-[var(--text-secondary)] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
      {showTotal && (
        <span className="ml-2 text-xs text-[var(--text-secondary)]">
          Page {page} of {totalPages}
        </span>
      )}
    </div>
  );
}
