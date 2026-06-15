"use client";

import { ChevronDown, MonitorPlay } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  getPreviewRoleByLocation,
  getPreviewRolePath,
  PREVIEW_ROLE_STORAGE_KEY,
  previewRoleOptions,
  type PreviewRole,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

interface RolePreviewSwitcherProps {
  tone?: "dark" | "light";
  compact?: boolean;
  className?: string;
}

export function RolePreviewSwitcher({
  tone = "light",
  compact = false,
  className,
}: RolePreviewSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeRole = getPreviewRoleByLocation(pathname);

  useEffect(() => {
    window.localStorage.setItem(PREVIEW_ROLE_STORAGE_KEY, activeRole);
  }, [activeRole]);

  const handleChange = (value: PreviewRole) => {
    const targetRoute = getPreviewRolePath(value);
    window.localStorage.setItem(PREVIEW_ROLE_STORAGE_KEY, value);

    if (pathname !== targetRoute) {
      router.replace(targetRoute);
    }
  };

  return (
    <div
      className={cn(
        "rounded-[1.25rem] border px-3 py-3 backdrop-blur-xl",
        compact ? "flex items-center gap-3" : "space-y-2.5",
        tone === "dark"
          ? "border-white/10 bg-white/8 text-white shadow-[0_12px_30px_rgba(7,14,26,0.18)]"
          : "border-[#d9e3ed] bg-white/84 text-[#102033] shadow-[0_14px_34px_rgba(20,32,53,0.08)]",
        className,
      )}
    >
      <div className={cn("flex items-center gap-2.5", compact && "shrink-0")}>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl",
            tone === "dark"
              ? "bg-white/10 text-[#9ee7e0]"
              : "bg-[#eef5fb] text-[#295086]",
          )}
        >
          <MonitorPlay className="h-4 w-4" />
        </div>
        <div>
          <p
            className={cn(
              "font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em]",
              tone === "dark" ? "text-white/45" : "text-[#6b7d91]",
            )}
          >
            Preview UI
          </p>
          {!compact ? (
            <p
              className={cn(
                "mt-1 text-sm",
                tone === "dark" ? "text-white/68" : "text-[#647688]",
              )}
            >
              Basculer rapidement entre les interfaces.
            </p>
          ) : null}
        </div>
      </div>

      <div className={cn("relative", compact ? "min-w-[170px]" : "w-full")}>
        <Select
          aria-label="Choisir une interface en mode preview"
          value={activeRole}
          className={cn(
            "pr-10 font-medium",
            tone === "dark"
              ? "border-white/10 bg-white/6 text-white focus:border-[#5ab7c0] focus:ring-2 focus:ring-[#5ab7c0]/20"
              : "border-[#d6e1ec] bg-[#f8fbff] text-[#102033] focus:border-[#2d6fcb] focus:ring-2 focus:ring-[#2d6fcb]/16",
          )}
          onChange={(event) => handleChange(event.target.value as PreviewRole)}
        >
          {previewRoleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2",
            tone === "dark" ? "text-white/55" : "text-[#6a7d91]",
          )}
        />
      </div>
    </div>
  );
}
