const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function NetWorthCard({ total }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full flex flex-col justify-center">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Total Net Worth</p>
      <p className="text-5xl font-bold text-white mt-3 tabular-nums">{fmt.format(total)}</p>
      <p className="text-slate-500 text-sm mt-3">
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}
