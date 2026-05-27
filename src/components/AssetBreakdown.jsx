import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const TYPE_COLORS = {
  // Cash
  "Bank & Credit Union": "#3b82f6",  // blue
  // Fixed income
  CD:                    "#06b6d4",  // cyan
  "Certificate Deposit": "#22d3ee",  // cyan lighter
  Bond:                  "#0ea5e9",  // sky
  Bonds:                 "#0ea5e9",
  Treasuries:            "#38bdf8",  // sky lighter
  // Equities / growth
  Stock:                 "#10b981",  // emerald
  Investment:            "#34d399",  // emerald lighter (legacy)
  Retirement:            "#f59e0b",  // amber
  HSA:                   "#14b8a6",  // teal
  // Alternative
  Crypto:                "#8b5cf6",  // violet
  Tangible:              "#f97316",  // orange
  Digital:               "#ec4899",  // pink
  Other:                 "#94a3b8",  // slate
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{name}</p>
      <p className="text-white font-semibold">{fmt.format(value)}</p>
    </div>
  );
}

export default function AssetBreakdown({ breakdown, total }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
      <h2 className="text-slate-300 font-medium mb-4">Asset Breakdown</h2>
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                strokeWidth={0}
              >
                {breakdown.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={TYPE_COLORS[entry.name] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          {breakdown.map(({ name, value }) => (
            <div key={name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[name] ?? "#94a3b8" }}
                />
                <span className="text-slate-300 text-sm">{name}</span>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-slate-100 text-sm font-medium">
                  {fmt.format(value)}
                </span>
                <span className="text-slate-500 text-xs ml-2">
                  {((value / total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
