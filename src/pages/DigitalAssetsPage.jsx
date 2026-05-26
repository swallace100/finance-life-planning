const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function gainColor(cost, current) {
  if (cost == null || current == null) return 'text-slate-400'
  return current >= cost ? 'text-emerald-400' : 'text-red-400'
}

function gainLabel(cost, current) {
  if (cost == null || current == null) return '—'
  const diff = current - cost
  const pct = ((diff / cost) * 100).toFixed(1)
  return `${diff >= 0 ? '+' : ''}${fmtCurrency.format(diff)} (${pct}%)`
}

export default function DigitalAssetsPage({ data }) {
  const stillOwned = a => a.StillHave !== false && a.StillHave !== 0
  const assets = (data?.DigitalAssets || []).filter(stillOwned)

  const totalCost  = assets.reduce((s, a) => s + (Number(a.Cost)         || 0), 0)
  const totalValue = assets.reduce((s, a) => s + (Number(a.CurrentValue) || 0), 0)
  const totalGain  = totalValue - totalCost

  const byCategory = assets.reduce((acc, a) => {
    const c = a.Category || 'Other'
    if (!acc[c]) acc[c] = []
    acc[c].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Digital Assets</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Current Value</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">{fmtCurrency.format(totalValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Cost</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">{fmtCurrency.format(totalCost)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Unrealized Gain</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{fmtCurrency.format(totalGain)}
          </p>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-500 text-sm">No digital assets found.</p>
        </div>
      ) : Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, rows]) => (
        <div key={category} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 font-medium">{category}</h3>
            <span className="text-slate-500 text-sm">{rows.length} item{rows.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left pb-2 pr-4">Name</th>
                  <th className="text-left pb-2 pr-4">Series</th>
                  <th className="text-left pb-2 pr-4">Format</th>
                  <th className="text-left pb-2 pr-4">Language</th>
                  <th className="text-right pb-2 pr-4">Purchased</th>
                  <th className="text-right pb-2 pr-4">Cost</th>
                  <th className="text-right pb-2 pr-4">Value</th>
                  <th className="text-right pb-2">Gain / Loss</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(a => (
                  <tr key={a.ID} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-3 pr-4 text-slate-200">
                      {a.Name}
                      {a.Author ? <span className="block text-xs text-slate-500">{a.Author}</span> : null}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{a.Series || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{a.Format || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{a.Language || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{fmtDate(a.BuyDate)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right tabular-nums">{fmtCurrency.format(a.Cost)}</td>
                    <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">{fmtCurrency.format(a.CurrentValue)}</td>
                    <td className={`py-3 text-right text-xs font-medium tabular-nums ${gainColor(a.Cost, a.CurrentValue)}`}>
                      {gainLabel(a.Cost, a.CurrentValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
