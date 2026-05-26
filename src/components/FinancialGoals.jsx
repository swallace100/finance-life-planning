const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'

const STATUS_STYLES = {
  'Goal Met': 'text-emerald-400 bg-emerald-400/10',
  'On Track': 'text-blue-400 bg-blue-400/10',
  'At Risk':  'text-red-400 bg-red-400/10',
}

export default function FinancialGoals({ goals, netWorth }) {
  if (!goals?.length) return null

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-slate-300 font-medium mb-5">Financial Goals</h2>
      <div className="space-y-5">
        {goals.map((goal, i) => {
          const target   = Number(goal.TargetAmount)
          const met      = goal.Status === 'Goal Met' || netWorth >= target
          const progress = met ? 100 : Math.min((netWorth / target) * 100, 100)

          return (
            <div key={goal.ID ?? i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-200 text-sm font-medium">{goal.Name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm tabular-nums">{fmtCurrency.format(target)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[goal.Status] ?? STATUS_STYLES['On Track']}`}>
                    {goal.Status}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${met ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-slate-500 text-xs tabular-nums">{progress.toFixed(0)}%</span>
                <span className="text-slate-500 text-xs">{fmtDate(goal.TargetDate)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
