interface ChartPoint {
  label: string;
  value: number;
  note?: string;
}

interface CallsChartProps {
  title: string;
  subtitle: string;
  data: ChartPoint[];
}

export function CallsChart({ title, subtitle, data }: CallsChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle,rgba(227,165,109,0.18),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">{title}</h3>
          <p className="mt-1 text-sm text-[#65788c]">{subtitle}</p>
        </div>
        <div className="rounded-full bg-[#fff3e7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8a5425]">
          Contacts disponibles
        </div>
      </div>

      <div className="mt-6 grid h-[320px] grid-cols-[40px_1fr] gap-4">
        <div className="flex h-full flex-col justify-between pb-8 text-[11px] text-[#7a8da3]">
          <span>35k</span>
          <span>25k</span>
          <span>15k</span>
          <span>5k</span>
        </div>
        <div className="flex h-full items-end gap-3 rounded-[1.6rem] border border-[#eef3f8] bg-[linear-gradient(180deg,#f9fcff_0%,#f4f8fc_100%)] px-4 pb-8 pt-6">
          {data.map((item, index) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
              <p className="text-sm font-semibold text-[#102033]">{item.value}</p>
              <div className="flex h-[220px] items-end">
                <div
                  className={`w-full min-w-[48px] rounded-t-[1.3rem] shadow-[0_16px_30px_rgba(33,90,180,0.18)] ${
                    index === 0
                      ? "bg-[linear-gradient(180deg,#ffd6b1_0%,#c9783d_100%)] shadow-[0_16px_30px_rgba(201,120,61,0.18)]"
                      : index === 1
                        ? "bg-[linear-gradient(180deg,#71dfc9_0%,#16857d_100%)] shadow-[0_16px_30px_rgba(22,133,125,0.18)]"
                        : "bg-[linear-gradient(180deg,#53a5ff_0%,#1e4fa3_100%)]"
                  }`}
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#20344b]">{item.label}</p>
                {item.note ? (
                  <p className="mt-1 inline-flex rounded-full bg-[#f5f9fd] px-2.5 py-1 text-[11px] text-[#7a8da3]">
                    {item.note}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
