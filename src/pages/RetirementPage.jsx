const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function EmptySection({ title, description }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-slate-300 font-medium mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  )
}

export default function RetirementPage({ data }) {
  const schedule = data?.RetirementSchedule || []
  const holdings = data?.RetirementHoldings || []
  const allocation = data?.FundAllocation   || []
  const assets  = data?.NonTangibleAssets   || []

  const assetMap = Object.fromEntries(assets.map(a => [a.ID, a]))
  const currentYear = new Date().getFullYear()

  const totalExpectedYearly = schedule.reduce((s, r) => s + (Number(r.ExpectedYearlyAmount) || 0), 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Retirement</h2>

      {/* Schedule */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-slate-300 font-medium">Schedule</h3>
          {schedule.length > 0 && (
            <span className="text-slate-400 text-sm tabular-nums">
              {fmtCurrency.format(totalExpectedYearly)}/yr total
            </span>
          )}
        </div>

        {schedule.length === 0 ? (
          <p className="text-slate-500 text-sm">No retirement schedule entries found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Account</th>
                <th className="text-right pb-2 pr-4">Accessible Year</th>
                <th className="text-right pb-2 pr-4">Years Away</th>
                <th className="text-right pb-2 pr-4">Expected / Year</th>
                <th className="text-left pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {schedule
                .slice()
                .sort((a, b) => (a.AccessibleYear ?? 0) - (b.AccessibleYear ?? 0))
                .map(r => {
                  const asset = r.AssetID ? assetMap[r.AssetID] : null
                  const yearsAway = r.AccessibleYear ? r.AccessibleYear - currentYear : null
                  const accessible = yearsAway !== null && yearsAway <= 0
                  return (
                    <tr key={r.ID} className="border-b border-slate-700/50 last:border-0">
                      <td className="py-3 pr-4 text-slate-200">
                        {asset ? asset.Name : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">{r.AccessibleYear ?? '—'}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {yearsAway === null ? '—' : accessible
                          ? <span className="text-emerald-400 font-medium">Accessible</span>
                          : <span className="text-slate-400">in {yearsAway} yrs</span>
                        }
                      </td>
                      <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">
                        {r.ExpectedYearlyAmount ? fmtCurrency.format(r.ExpectedYearlyAmount) : '—'}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">{r.Notes || ''}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Holdings */}
      {holdings.length > 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-slate-300 font-medium mb-4">Holdings</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Account</th>
                <th className="text-left pb-2 pr-4">Fund</th>
                <th className="text-left pb-2 pr-4">Ticker</th>
                <th className="text-right pb-2 pr-4">%</th>
                <th className="text-left pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={h.ID ?? i} className="border-b border-slate-700/50 last:border-0">
                  <td className="py-3 pr-4 text-slate-400">{h.AssetID ? (assetMap[h.AssetID]?.Name ?? h.AssetID) : '—'}</td>
                  <td className="py-3 pr-4 text-slate-200">{h.FundName}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">{h.Ticker}</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">{h.Percentage}%</td>
                  <td className="py-3 text-slate-500 text-xs">{h.Notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptySection
          title="Holdings"
          description="No retirement holdings recorded yet. Add entries to the RetirementHoldings sheet to see fund breakdown by account."
        />
      )}

      {/* Fund Allocation */}
      {allocation.length > 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-slate-300 font-medium mb-4">Fund Allocation</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Holding ID</th>
                <th className="text-left pb-2 pr-4">Asset Class</th>
                <th className="text-right pb-2">%</th>
              </tr>
            </thead>
            <tbody>
              {allocation.map((a, i) => (
                <tr key={a.ID ?? i} className="border-b border-slate-700/50 last:border-0">
                  <td className="py-3 pr-4 text-slate-400">{a.HoldingID}</td>
                  <td className="py-3 pr-4 text-slate-200">{a.AssetClass}</td>
                  <td className="py-3 text-slate-300 text-right tabular-nums">{a.Percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptySection
          title="Fund Allocation"
          description="No fund allocation recorded yet. Add entries to the FundAllocation sheet to see asset class breakdown by holding."
        />
      )}
    </div>
  )
}
