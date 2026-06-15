import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full appearance-none rounded-full border bg-transparent px-3 pr-9 text-sm outline-none transition",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
