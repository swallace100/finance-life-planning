import CDMaturities from '../components/CDMaturities'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000)

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-white mt-2 tabular-nums">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function CDsPage({ data }) {
  const cds = data?.CDs || []
  const now = new Date()
  const oneYearOut = new Date(now)
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1)

  const active  = cds.filter(cd => cd.Active)
  const matured = cds.filter(cd => !cd.Active)
  const upcoming = active
    .filter(cd => new Date(cd.MaturityDate) <= oneYearOut)
    .sort((a, b) => new Date(a.MaturityDate) - new Date(b.MaturityDate))

  const totalActive = active.reduce((s, cd) => s + (Number(cd.FaceValue) || 0), 0)
  const avgAPY = active.length
    ? (active.reduce((s, cd) => s + (Number(cd.APY) || 0), 0) / active.length).toFixed(2)
    : '—'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Certificates of Deposit</h2>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Value"  value={fmtCurrency.format(totalActive)} />
        <StatCard label="Active CDs"    value={active.length} sub={`${matured.length} matured`} />
        <StatCard label="Avg APY"       value={`${avgAPY}%`} sub="across active CDs" />
      </div>

      <CDMaturities cds={upcoming} />

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-slate-300 font-medium mb-4">All Active CDs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Name</th>
                <th className="text-left pb-2 pr-4">Institution</th>
                <th className="text-right pb-2 pr-4">Value</th>
                <th className="text-right pb-2 pr-4">APY</th>
                <th className="text-right pb-2 pr-4">Start</th>
                <th className="text-right pb-2 pr-4">Matures</th>
                <th className="text-right pb-2">Days</th>
              </tr>
            </thead>
            <tbody>
              {active.sort((a, b) => new Date(a.MaturityDate) - new Date(b.MaturityDate)).map(cd => {
                const days = daysUntil(cd.MaturityDate)
                const color = days < 30 ? 'text-red-400' : days < 90 ? 'text-amber-400' : 'text-emerald-400'
                return (
                  <tr key={cd.ID} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-3 pr-4 text-slate-200">
                      {cd.Name}
                      {cd.AutoRenew && (
                        <span className="ml-2 text-xs text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">Auto-renews</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{cd.Institution}</td>
                    <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">{fmtCurrency.format(cd.FaceValue)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{cd.APY}%</td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{fmtDate(cd.StartDate)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{fmtDate(cd.MaturityDate)}</td>
                    <td className={`py-3 text-right font-semibold tabular-nums ${color}`}>{days}d</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {matured.length > 0 && (
          <>
            <h3 className="text-slate-500 font-medium mt-6 mb-3 text-sm">Matured</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {matured.sort((a, b) => new Date(b.MaturityDate) - new Date(a.MaturityDate)).map(cd => (
                    <tr key={cd.ID} className="border-b border-slate-700/30 last:border-0">
                      <td className="py-2 pr-4 text-slate-500">{cd.Name}</td>
                      <td className="py-2 pr-4 text-slate-600">{cd.Institution}</td>
                      <td className="py-2 pr-4 text-slate-500 text-right tabular-nums">{fmtCurrency.format(cd.FaceValue)}</td>
                      <td className="py-2 pr-4 text-slate-600 text-right">{cd.APY}%</td>
                      <td className="py-2 text-slate-600 text-right">{fmtDate(cd.MaturityDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
