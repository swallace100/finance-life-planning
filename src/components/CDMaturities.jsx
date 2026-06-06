const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000)

export default function CDMaturities({ cds }) {
  return (
    <div className="card p-6">
      <h2 className="text-slate-300 font-medium mb-4">
        Upcoming CD Maturities
        <span className="text-slate-500 text-sm font-normal ml-2">(next 12 months)</span>
      </h2>

      {cds.length === 0 ? (
        <p className="text-slate-500 text-sm">No CDs maturing in the next 12 months.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Name</th>
                <th className="text-left pb-2 pr-4">Institution</th>
                <th className="text-right pb-2 pr-4">Value</th>
                <th className="text-right pb-2 pr-4">APY</th>
                <th className="text-right pb-2 pr-4">Matures</th>
                <th className="text-right pb-2">Days</th>
              </tr>
            </thead>
            <tbody>
              {cds.map(cd => {
                const days = daysUntil(cd.MaturityDate)
                const urgency = days < 30 ? 'text-red-400' : days < 90 ? 'text-amber-400' : 'text-emerald-400'
                return (
                  <tr key={cd.ID} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-3 pr-4 text-slate-200">
                      {cd.Name}
                      {cd.AutoRenew && (
                        <span className="ml-2 text-xs text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">
                          Auto-renews
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{cd.Institution}</td>
                    <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">
                      {fmtCurrency.format(cd.FaceValue)}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{cd.APY}%</td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{fmtDate(cd.MaturityDate)}</td>
                    <td className={`py-3 text-right font-semibold tabular-nums ${urgency}`}>{days}d</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
