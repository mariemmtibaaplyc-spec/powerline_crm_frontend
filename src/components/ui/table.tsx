import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function TableWrapper({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-[#dce6f0] bg-white shadow-[0_12px_30px_rgba(20,32,53,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full min-w-full text-left text-sm", className)}
      {...props}
    />
  );
}

export function TableHeadCell({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-[#edf2f7] px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("border-b border-[#edf2f7] px-4 py-3 text-[#102033]", className)}
      {...props}
    />
  );
}
