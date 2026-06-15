export const REPORTING_SURFACE_CLASS =
  "border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]";

export const REPORTING_HEADER_PILL_CLASS =
  "inline-flex items-center gap-2 rounded-full bg-[#eef5fb] px-3 py-2 text-sm font-medium text-[#295086]";

export const REPORTING_EMPTY_TEXT_CLASS = "text-sm text-[#607287]";

export const REPORTING_STATUS_COLORS = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pause: "border-amber-200 bg-amber-50 text-amber-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-700",
  neutral: "border-[#d9e7f7] bg-[#f5f9ff] text-[#295086]",
} as const;
