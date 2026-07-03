"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_NEIGHBOR_COUNT = 2;

type ContactsPaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  currentItemCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

function buildVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (
    let page = currentPage - PAGE_NEIGHBOR_COUNT;
    page <= currentPage + PAGE_NEIGHBOR_COUNT;
    page += 1
  ) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((left, right) => left - right);
}

function formatNumber(value: number) {
  return value.toLocaleString("fr-FR");
}

function PaginationButton({
  children,
  active = false,
  disabled = false,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition",
        active
          ? "border-[#2d6fcb] bg-[#2d6fcb] text-white shadow-[0_14px_28px_rgba(45,111,203,0.2)]"
          : "border-[#dce6f0] bg-white text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.05)] hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff]",
        disabled && "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-[#dce6f0] hover:bg-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ContactsPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  currentItemCount,
  onPageChange,
  onPageSizeChange,
  className,
}: ContactsPaginationProps) {
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const hasPagination = totalPages > 1;
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = totalItems === 0 ? 0 : rangeStart + Math.max(currentItemCount - 1, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:flex-1">
          <p className="text-sm text-[#607287]">
            Affichage de{" "}
            <span className="font-semibold text-[#102033]">{formatNumber(rangeStart)}</span> à{" "}
            <span className="font-semibold text-[#102033]">{formatNumber(rangeEnd)}</span> sur{" "}
            <span className="font-semibold text-[#102033]">{formatNumber(totalItems)}</span>{" "}
            contacts
          </p>

          <label className="flex items-center gap-2 text-sm text-[#607287]">
            <span>Lignes par page</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-10 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.05)] outline-none transition hover:border-[#c9d8e7]"
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {hasPagination ? (
        <nav
          aria-label="Pagination des contacts"
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center justify-between gap-3 md:justify-start">
            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="min-w-[132px] gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Precedent
            </PaginationButton>

            <div className="inline-flex h-10 items-center justify-center rounded-full border border-[#dce6f0] bg-[#fbfdff] px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.05)] md:hidden">
              Page {formatNumber(currentPage)} / {formatNumber(totalPages)}
            </div>

            <PaginationButton
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="min-w-[132px] gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
            {visiblePages.map((page, index) => {
              const previousPage = visiblePages[index - 1];
              const hasGap = previousPage !== undefined && page - previousPage > 1;

              return (
                <div key={`page-group-${page}`} className="flex items-center gap-2">
                  {hasGap ? (
                    <span className="inline-flex h-10 items-center justify-center px-1 text-sm font-semibold text-[#7a8da3]">
                      ...
                    </span>
                  ) : null}
                  <PaginationButton
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                  >
                    {formatNumber(page)}
                  </PaginationButton>
                </div>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
