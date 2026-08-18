import StatCard from '../components/StatCard'
import { stillOwned } from '../utils/netWorth'

const fmt = (n) => '$' + Math.round(n).toLocaleString()

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

export default function CollectionsOverview({ data }) {
  if (!data) return null

  const tangible = (data.TangibleAssets || []).filter(stillOwned)
  const digital  = (data.DigitalAssets  || []).filter(stillOwned)
  const tangibleValue = tangible.reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
  const digitalValue  = digital.reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)

  const wishlist  = data.Wishlist || []
  const wanted    = wishlist
    .filter(w => w.Status !== 'Purchased')
    .slice()
    .sort((a, b) => (PRIORITY_ORDER[a.Priority] ?? 3) - (PRIORITY_ORDER[b.Priority] ?? 3))
  const wantedSum = wanted.reduce((s, w) => s + (Number(w.TargetPrice) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Collections Value"
          value={fmt(tangibleValue + digitalValue)}
          sub="counted in Finance net worth"
          valueClass="text-amber-400"
        />
        <StatCard label="Tangible Assets" value={tangible.length} sub={fmt(tangibleValue)} />
        <StatCard label="Digital Assets"  value={digital.length}  sub={fmt(digitalValue)} />
        <StatCard
          label="Wishlist"
          value={wanted.length}
          sub={wantedSum > 0 ? `${fmt(wantedSum)} to go` : 'items wanted'}
        />
      </div>

      <div className="card p-6">
        <h2 className="text-slate-300 font-medium mb-4">Top of Wishlist</h2>
        {wanted.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Nothing on the wishlist yet — add items on the Wishlist page.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {wanted.slice(0, 8).map((w, i) => (
              <div key={w.ID ?? i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-semibold uppercase tracking-wide w-14 flex-shrink-0 ${
                    w.Priority === 'High' ? 'text-red-400' : w.Priority === 'Low' ? 'text-slate-500' : 'text-amber-400'
                  }`}>
                    {w.Priority || 'Medium'}
                  </span>
                  <span className="text-slate-300 text-sm truncate">{w.Name}</span>
                </div>
                {w.TargetPrice > 0 && (
                  <span className="text-slate-500 text-xs tabular-nums ml-3 flex-shrink-0">
                    {fmt(w.TargetPrice)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {tangible.length === 0 && digital.length === 0 && wishlist.length === 0 && (
        <p className="text-slate-500 text-sm">
          Nothing here yet — add items under Tangible Assets, Digital Assets, or Wishlist.
        </p>
      )}
    </div>
  )
}
