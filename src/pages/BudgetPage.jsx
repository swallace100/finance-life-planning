const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const isActive = item => item.Active === 'Yes' || item.Active === true || item.Active === 1

export default function BudgetPage({ data }) {
  const items = (data?.Budget || []).filter(isActive)

  const income   = items.filter(i => Number(i.Amount) > 0)
  const expenses = items.filter(i => Number(i.Amount) < 0)

  const monthlyIncome   = income.reduce((s, i)   => s + (Number(i.Amount) || 0), 0)
  const monthlyExpenses = expenses.reduce((s, i) => s + (Number(i.Amount) || 0), 0)
  const netMonthly      = monthlyIncome + monthlyExpenses

  const expensesByType = expenses.reduce((acc, i) => {
    const t = i.Type || 'Other'
    if (!acc[t]) acc[t] = []
    acc[t].push(i)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Budget</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Monthly Income</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 tabular-nums">{fmtCurrency.format(monthlyIncome)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Monthly Expenses</p>
          <p className="text-3xl font-bold text-red-400 mt-2 tabular-nums">{fmtCurrency.format(Math.abs(monthlyExpenses))}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Net Monthly</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${netMonthly >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netMonthly >= 0 ? '+' : ''}{fmtCurrency.format(netMonthly)}
          </p>
        </div>
      </div>

      {/* Income */}
      {income.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-slate-300 font-medium">Income</h3>
            <span className="text-emerald-400 text-sm tabular-nums font-medium">{fmtCurrency.format(monthlyIncome)}/mo</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Name</th>
                <th className="text-left pb-2 pr-4">Type</th>
                <th className="text-left pb-2 pr-4">Frequency</th>
                <th className="text-right pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {income.map((i, idx) => (
                <tr key={i.ID ?? idx} className="border-b border-slate-700/50 last:border-0">
                  <td className="py-3 pr-4 text-slate-200">{i.Name}</td>
                  <td className="py-3 pr-4 text-slate-400">{i.Type}</td>
                  <td className="py-3 pr-4 text-slate-400">{i.Frequency}</td>
                  <td className="py-3 text-right font-medium tabular-nums text-emerald-400">{fmtCurrency.format(i.Amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses grouped by Type */}
      {Object.entries(expensesByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, rows]) => {
        const typeTotal = rows.reduce((s, i) => s + (Number(i.Amount) || 0), 0)
        return (
          <div key={type} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-slate-300 font-medium">{type}</h3>
              <span className="text-red-400 text-sm tabular-nums font-medium">{fmtCurrency.format(Math.abs(typeTotal))}/mo</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left pb-2 pr-4">Name</th>
                  <th className="text-left pb-2 pr-4">Frequency</th>
                  <th className="text-right pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i, idx) => (
                  <tr key={i.ID ?? idx} className="border-b border-slate-700/50 last:border-0">
                    <td className="py-3 pr-4 text-slate-200">{i.Name}</td>
                    <td className="py-3 pr-4 text-slate-400">{i.Frequency}</td>
                    <td className="py-3 text-right tabular-nums text-slate-300">{fmtCurrency.format(Math.abs(i.Amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-500 text-sm">No budget items found.</p>
        </div>
      )}
    </div>
  )
}
