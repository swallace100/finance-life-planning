import StatCard from '../components/StatCard'
import { stillOwned } from '../utils/netWorth'

const fmt = (n) => '$' + Math.round(n).toLocaleString()

function collectRecentMedia(data) {
  const entries = [
    ...(data?.ReadingLog || []).map(r => ({ name: r.Name, kind: 'Book', date: r.ReadDate, color: 'text-amber-400' })),
    ...(data?.FilmLog    || []).map(r => ({ name: r.Name, kind: 'Film', date: r.WatchDate, color: 'text-sky-400' })),
    ...(data?.GamingLog  || []).map(r => ({ name: r.Name, kind: 'Game', date: r.CompletionDate, color: 'text-emerald-400' })),
  ].filter(e => e.name && e.date)
  return entries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)
}

export default function CollectionsOverview({ data }) {
  if (!data) return null

  const tangible = (data.TangibleAssets || []).filter(stillOwned)
  const digital  = (data.DigitalAssets  || []).filter(stillOwned)
  const tangibleValue = tangible.reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
  const digitalValue  = digital.reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)

  const wishlist  = data.Wishlist || []
  const wanted    = wishlist.filter(w => w.Status !== 'Purchased')
  const wantedSum = wanted.reduce((s, w) => s + (Number(w.TargetPrice) || 0), 0)

  const recent = collectRecentMedia(data)
  const mediaCount = (data.ReadingLog?.length || 0) + (data.FilmLog?.length || 0) + (data.GamingLog?.length || 0)

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
        <h2 className="text-slate-300 font-medium mb-4">Recent Media</h2>
        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No dated entries yet — log books, films, and games on the Media page.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {recent.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-semibold uppercase tracking-wide w-10 flex-shrink-0 ${e.color}`}>
                    {e.kind}
                  </span>
                  <span className="text-slate-300 text-sm truncate">{e.name}</span>
                </div>
                <span className="text-slate-500 text-xs tabular-nums ml-3 flex-shrink-0">
                  {new Date(e.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {mediaCount === 0 && tangible.length === 0 && digital.length === 0 && wishlist.length === 0 && (
        <p className="text-slate-500 text-sm">
          Nothing here yet — add items under Tangible Assets, Digital Assets, Media, or Wishlist.
        </p>
      )}
    </div>
  )
}
