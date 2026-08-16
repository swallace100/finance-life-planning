import { useState } from 'react'
import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'

const fmt$ = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function fmtLarge(v) {
  if (v == null || isNaN(v)) return '—'
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}k`
  return fmt$.format(v)
}

// Standard future value with annual contributions: FV = PV*(1+r)^n + C*((1+r)^n - 1)/r
function fv(pv, ratePercent, n, annualAdd = 0) {
  const r = (ratePercent || 0) / 100
  if (r === 0) return pv + annualAdd * n
  const factor = Math.pow(1 + r, n)
  return pv * factor + annualAdd * (factor - 1) / r
}

function computeCurrentValues(data) {
  const assets = data?.NonTangibleAssets || []
  const history = data?.AssetHistory || []
  const cds = data?.CDs || []

  const latestByAsset = {}
  history.forEach(h => {
    const ex = latestByAsset[h.AssetID]
    if (!ex || new Date(h.Date) > new Date(ex.Date)) latestByAsset[h.AssetID] = h
  })
  const val = id => Number(latestByAsset[id]?.Value) || 0

  const CASH_TYPES    = new Set(['Bank', 'Credit Union'])
  const BOND_TYPES    = new Set(['Bonds', 'Treasuries', 'Bond'])
  const STOCK_TYPES   = new Set(['Investment', 'Stock'])
  const RETIRE_TYPES  = new Set(['Retirement', 'HSA'])

  const cash       = assets.filter(a => CASH_TYPES.has(a.Type)).reduce((s, a) => s + val(a.ID), 0)
  const bonds      = assets.filter(a => BOND_TYPES.has(a.Type)).reduce((s, a) => s + val(a.ID), 0)
  const stocks     = assets.filter(a => STOCK_TYPES.has(a.Type)).reduce((s, a) => s + val(a.ID), 0)
  const retirement = assets.filter(a => RETIRE_TYPES.has(a.Type)).reduce((s, a) => s + val(a.ID), 0)
  const crypto     = assets.filter(a => a.Type === 'Crypto').reduce((s, a) => s + val(a.ID), 0)
  const cdTotal    = cds
    .filter(c => c.Active === true || c.Active === 1 || c.Active === 'Yes')
    .reduce((s, c) => s + (Number(c.FaceValue) || 0), 0)

  return { cash, bonds, stocks, retirement, crypto, cds: cdTotal }
}

function computeBudgetSurplus(data) {
  const items = (data?.Budget || []).filter(b =>
    b.Active === 'Yes' || b.Active === true || b.Active === 1
  )
  let income = 0, expense = 0
  items.forEach(b => {
    const monthly = Number(b.Amount) || 0
    if (monthly > 0) income += monthly
    else expense += Math.abs(monthly)
  })
  const monthly = income - expense
  return { monthlyIncome: income, monthlyExpense: expense, monthlySurplus: monthly, annualSurplus: monthly * 12 }
}

// Maps a label string to a computed current value by keyword matching
function matchAutoValue(label, cv) {
  const l = (label || '').toLowerCase()
  if (l.includes('cash') || l.includes('bank') || l.includes('checking') || l.includes('saving')) return cv.cash
  if (l.includes('cd') || l.includes('certificate')) return cv.cds
  if (l.includes('bond') || l.includes('treasur')) return cv.bonds
  if (l.includes('stock') || l.includes('invest') || l.includes('brokerage')) return cv.stocks
  if (l.includes('retire') || l.includes('401') || l.includes('ira') || l.includes('hsa')) return cv.retirement
  if (l.includes('crypto') || l.includes('bitcoin') || l.includes('btc') || l.includes('eth')) return cv.crypto
  return null
}

const DEFAULT_ROWS = [
  { Label: 'Cash',             GrowthRate: 1.0,  AnnualAdd: 0, Notes: 'HYSA / checking / savings' },
  { Label: 'CDs',              GrowthRate: 3.0,  AnnualAdd: 0, Notes: '' },
  { Label: 'Bonds/Treasuries', GrowthRate: 4.0,  AnnualAdd: 0, Notes: '' },
  { Label: 'Stocks',           GrowthRate: 7.0,  AnnualAdd: 0, Notes: 'Historical avg ~7-10%' },
  { Label: 'Retirement',       GrowthRate: 6.0,  AnnualAdd: 0, Notes: 'Add 401k match to Annual Contribution' },
  { Label: 'Crypto',           GrowthRate: 10.0, AnnualAdd: 0, Notes: 'High risk / speculative' },
]

const INTERVALS = [1, 5, 10, 20, 30]
const HIGHLIGHT = [5, 20, 30]
const HIGHLIGHT_STYLE = [
  { border: 'border-blue-500/20',   bg: 'bg-blue-500/10',   text: 'text-blue-400'   },
  { border: 'border-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  { border: 'border-emerald-500/20',bg: 'bg-emerald-500/10',text: 'text-emerald-400'},
]

export default function ProjectionPage({ data, onSave, onDelete }) {
  const [realTerms, setRealTerms]   = useState(false)
  const [inflation, setInflation]   = useState(3.0)
  const modal = useEntityModal()

  const saved        = data?.ProjectionSettings || []
  const currentValues = computeCurrentValues(data)
  const surplus       = computeBudgetSurplus(data)

  // Merge saved overrides into the default categories (by Label) instead of
  // replacing the defaults outright, so adding one custom asset doesn't wipe
  // out the other auto-computed rows.
  const savedByLabel = {}
  saved.forEach(r => { savedByLabel[(r.Label || '').trim().toLowerCase()] = r })

  const defaultLabels = new Set(DEFAULT_ROWS.map(d => d.Label.trim().toLowerCase()))
  const mergedDefaults = DEFAULT_ROWS.map(def => savedByLabel[def.Label.trim().toLowerCase()] || def)
  const customRows = saved.filter(r => !defaultLabels.has((r.Label || '').trim().toLowerCase()))

  const rows = [...mergedDefaults, ...customRows]
  const hasUnsavedDefaults = mergedDefaults.some(r => r._rowIndex == null)

  const resolved = rows.map(r => {
    const hasOverride = r.StartValue != null && r.StartValue !== ''
    const auto  = matchAutoValue(r.Label, currentValues)
    const start = hasOverride ? Number(r.StartValue) : (auto ?? 0)
    return { ...r, _start: start, _auto: !hasOverride }
  })

  function project(row, n) {
    const raw = fv(row._start, Number(row.GrowthRate) || 0, n, Number(row.AnnualAdd) || 0)
    return realTerms ? raw / Math.pow(1 + inflation / 100, n) : raw
  }

  const totalStart     = resolved.reduce((s, r) => s + r._start, 0)
  const totalsAtYear   = INTERVALS.map(n => resolved.reduce((s, r) => s + project(r, n), 0))
  const totalAllocated = rows.reduce((s, r) => s + (Number(r.AnnualAdd) || 0), 0)
  const unallocated    = surplus.annualSurplus - totalAllocated

  async function handleSubmit(row) {
    await onSave('ProjectionSettings', row, row._rowIndex == null)
    modal.close()
  }

  async function handleDelete(row) {
    await onDelete('ProjectionSettings', row._rowIndex)
    modal.close()
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="page-title">Financial Projection</h2>
        <button
          onClick={() => modal.openAdd({})}
          className="btn-primary"
        >
          + Add Asset
        </button>
      </div>

      {/* Highlight milestone cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {HIGHLIGHT.map((n, i) => {
          const idx = INTERVALS.indexOf(n)
          const projected = totalsAtYear[idx]
          const mult = totalStart > 0 ? (projected / totalStart).toFixed(1) : null
          const s = HIGHLIGHT_STYLE[i]
          return (
            <div key={n} className={`rounded-xl border p-5 ${s.bg} ${s.border}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                In {n} Years {realTerms ? '(real)' : ''}
              </p>
              <p className={`text-3xl font-bold tabular-nums mt-2 ${s.text}`}>
                {fmtLarge(projected)}
              </p>
              {mult && (
                <p className="text-slate-500 text-xs mt-1">{mult}× current net worth</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Budget Surplus Banner */}
      {surplus.monthlySurplus !== 0 && (
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Budget Surplus</p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-slate-500 text-xs">Monthly Surplus</p>
              <p className={`text-2xl font-bold tabular-nums mt-0.5 ${surplus.monthlySurplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt$.format(surplus.monthlySurplus)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Annual Surplus</p>
              <p className={`text-2xl font-bold tabular-nums mt-0.5 ${surplus.annualSurplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt$.format(surplus.annualSurplus)}
              </p>
            </div>
            {totalAllocated > 0 && (
              <div>
                <p className="text-slate-500 text-xs">Allocated to Rows</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5 text-blue-400">
                  {fmt$.format(totalAllocated)}
                </p>
              </div>
            )}
            {surplus.annualSurplus > 0 && totalAllocated < surplus.annualSurplus && (
              <div>
                <p className="text-slate-500 text-xs">Unallocated</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5 text-amber-400">
                  {fmt$.format(unallocated)}
                </p>
              </div>
            )}
          </div>
          {unallocated > 0 && surplus.annualSurplus > 0 && (
            <p className="text-slate-600 text-xs mt-3">
              Tip: set "Annual Contribution" on your rows to put {fmt$.format(unallocated)} of unallocated annual surplus to work.
            </p>
          )}
        </div>
      )}

      {/* Assumptions table */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projection Assumptions</p>
          {hasUnsavedDefaults && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
              Click a row to customize and save your own settings
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Asset / Source</th>
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Starting Value</th>
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Growth %</th>
                <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Annual Add</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((row, i) => (
                <tr
                  key={row._rowIndex ?? i}
                  className="border-b border-slate-700/40 last:border-0 transition-colors cursor-pointer hover:bg-slate-700/30"
                  onClick={() => row._rowIndex != null ? modal.openEdit(row) : modal.openAdd(row)}
                >
                  <td className="py-2.5 pr-4 font-medium text-slate-200">{row.Label}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    <span className={row._auto ? 'text-slate-400' : 'text-slate-200'}>
                      {fmt$.format(row._start)}
                    </span>
                    {row._auto && (
                      <span className="ml-1.5 text-xs text-slate-600 italic">auto</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums font-semibold text-emerald-400">
                    {Number(row.GrowthRate).toFixed(1)}%
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-blue-400">
                    {Number(row.AnnualAdd) > 0 ? `+${fmt$.format(Number(row.AnnualAdd))}` : '—'}
                  </td>
                  <td className="py-2.5 text-slate-500 text-xs max-w-xs">{row.Notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full projection table */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projected Growth</p>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={realTerms}
                onChange={e => setRealTerms(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span className="text-xs text-slate-400">Inflation-adjusted (real dollars)</span>
            </label>
            {realTerms && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Inflation:</span>
                <input
                  type="number"
                  value={inflation}
                  onChange={e => setInflation(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="20"
                  className="w-16 text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 text-center"
                />
                <span className="text-xs text-slate-500">%/yr</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</th>
                <th className="pb-2 pr-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Now</th>
                {INTERVALS.map(n => (
                  <th key={n} className="pb-2 pr-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    +{n}yr
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolved.map((row, i) => (
                <tr key={row._rowIndex ?? i} className="border-b border-slate-700/40 last:border-0 group">
                  <td className="py-2.5 pr-3">
                    <span className="text-slate-300">{row.Label}</span>
                    <span className="ml-2 text-emerald-400 text-xs">{Number(row.GrowthRate).toFixed(1)}%</span>
                    {Number(row.AnnualAdd) > 0 && (
                      <span className="ml-1.5 text-blue-400 text-xs">+{fmt$.format(Number(row.AnnualAdd))}/yr</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-slate-500">
                    {fmtLarge(row._start)}
                  </td>
                  {INTERVALS.map(n => (
                    <td key={n} className="py-2.5 pr-3 text-right tabular-nums text-slate-200">
                      {fmtLarge(project(row, n))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-600">
                <td className="pt-3 pr-3 font-semibold text-slate-100 text-sm">Total</td>
                <td className="pt-3 pr-3 text-right tabular-nums font-semibold text-slate-300">
                  {fmtLarge(totalStart)}
                </td>
                {totalsAtYear.map((t, idx) => (
                  <td key={idx} className="pt-3 pr-3 text-right tabular-nums font-bold text-emerald-400">
                    {fmtLarge(t)}
                  </td>
                ))}
              </tr>
              {realTerms && (
                <tr>
                  <td colSpan={2 + INTERVALS.length} className="pt-2 text-xs text-slate-600">
                    Values shown in today's purchasing power, adjusted for {inflation.toFixed(1)}% annual inflation.
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 px-1">
        Projections use compound growth (FV = PV·(1+r)ⁿ + C·((1+r)ⁿ−1)/r) with annual contributions added at year end.
        "Starting value" defaults marked <em>auto</em> are derived from your current account balances.
        Past performance does not guarantee future results.
      </p>

      {/* Edit modal */}
      <Modal
        open={modal.open}
        onClose={modal.close}
        title={modal.isEditing ? 'Edit Projection Asset' : 'Add Projection Asset'}
      >
        <EntityForm
          schema={SCHEMAS.ProjectionSettings}
          initialValues={modal.editRow}
          isEditing={modal.isEditing}
          onSubmit={handleSubmit}
          onDelete={modal.isEditing ? () => handleDelete(modal.editRow) : undefined}
          onCancel={modal.close}
        />
      </Modal>

    </div>
  )
}
