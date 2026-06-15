import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] hover:-translate-y-0.5 hover:opacity-95",
  secondary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_18px_40px_rgba(15,106,102,0.16)] hover:-translate-y-0.5 hover:opacity-95",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-black/5",
  danger: "bg-[var(--danger)] text-white",
} as const;

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
