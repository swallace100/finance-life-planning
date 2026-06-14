export default function StatCard({ label, value, sub, valueClass = 'text-white' }) {
  return (
    <div className="card p-5">
      <p className="stat-label">{label}</p>
      <p className={`text-3xl font-bold mt-2 tabular-nums ${valueClass}`}>{value}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}
