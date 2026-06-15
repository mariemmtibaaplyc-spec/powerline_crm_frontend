interface FilterItem {
  label: string;
  value: string;
}

interface ActionItem {
  label: string;
  primary?: boolean;
}

interface ReportingFiltersProps {
  filters: FilterItem[];
  actions: ActionItem[];
}

export function ReportingFilters({
  filters,
  actions,
}: ReportingFiltersProps) {
  return (
    <div className="rounded-[1.6rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 shadow-[0_12px_30px_rgba(20,32,53,0.06)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f0b57d]/28 bg-[#fff3e7] px-3.5 py-2 text-sm font-medium text-[#8a5425] shadow-[0_8px_18px_rgba(227,165,109,0.12)]">
            <span className="h-2 w-2 rounded-full bg-[#e3a56d]" />
            Live plateau
          </span>
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6e1ec] bg-[#f7fbff] px-3.5 py-2 text-sm text-[#28435d] transition hover:border-[#b7cadc] hover:bg-[#f1f7fb]"
            >
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                {filter.label}
              </span>
              <span className="font-medium text-[#102033]">{filter.value}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={
                action.primary
                  ? "inline-flex items-center rounded-full bg-[linear-gradient(135deg,#163a66_0%,#2450a6_100%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_28px_rgba(36,80,166,0.18)] transition hover:shadow-[0_16px_30px_rgba(227,165,109,0.16)]"
                  : "inline-flex items-center rounded-full border border-[#f0b57d]/26 bg-[#fffaf4] px-4 py-2.5 text-sm font-medium text-[#7d4f26] transition hover:bg-[#fff5eb]"
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
