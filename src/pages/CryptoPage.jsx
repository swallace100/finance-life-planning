const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmtPct  = (v) => v ? `${Number(v).toFixed(2)}%` : '—'

function Badge({ children, color = 'slate' }) {
  const colors = {
    green:  'text-emerald-400 bg-emerald-400/10',
    amber:  'text-amber-400 bg-amber-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    slate:  'text-slate-400 bg-slate-400/10',
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

export default function CryptoPage({ data }) {
  const assets = data?.CryptoAssets || []
  const staked = assets.filter(a => a.Staked)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Crypto Assets</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Assets</p>
          <p className="text-3xl font-bold text-white mt-2">{assets.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Staking</p>
          <p className="text-3xl font-bold text-white mt-2">{staked.length}</p>
          <p className="text-slate-500 text-xs mt-1">of {assets.length} assets</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-slate-300 font-medium mb-4">Holdings</h3>
        {assets.length === 0 ? (
          <p className="text-slate-500 text-sm">No crypto assets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left pb-2 pr-4">Name</th>
                  <th className="text-left pb-2 pr-4">Ticker</th>
                  <th className="text-left pb-2 pr-4">Wallet</th>
                  <th className="text-left pb-2 pr-4">Staking</th>
                  <th className="text-right pb-2 pr-4">APY</th>
                  <th className="text-right pb-2">Unlock Date</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.ID} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-3 pr-4 text-slate-200 font-medium">{a.Name}</td>
                    <td className="py-3 pr-4">
                      <Badge color="purple">{a.Ticker}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{a.Wallet || '—'}</td>
                    <td className="py-3 pr-4">
                      {a.Staked
                        ? <Badge color="green">{a.AutoRestake ? 'Auto-restake' : 'Staked'}</Badge>
                        : <span className="text-slate-600 text-xs">—</span>
                      }
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-right">{a.Staked ? fmtPct(a.StakingAPY) : '—'}</td>
                    <td className="py-3 text-slate-400 text-right">{a.Staked ? fmtDate(a.UnlockDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {assets.some(a => a.Notes) && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-slate-300 font-medium mb-3">Notes</h3>
          <div className="space-y-2">
            {assets.filter(a => a.Notes).map(a => (
              <div key={a.ID} className="flex gap-3 text-sm">
                <Badge color="purple">{a.Ticker}</Badge>
                <span className="text-slate-400">{a.Notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
