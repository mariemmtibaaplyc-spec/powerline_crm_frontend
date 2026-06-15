import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
      >
        <ChevronLeft className="h-4 w-4" />
        Precedent
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const active = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition",
                active
                  ? "border-[#2d6fcb] bg-[#2d6fcb] text-white shadow-[0_14px_28px_rgba(45,111,203,0.2)]"
                  : "border-[#dce6f0] bg-white text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.05)] hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff]",
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
      >
        Suivant
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
