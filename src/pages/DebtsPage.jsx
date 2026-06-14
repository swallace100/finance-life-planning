import { useState } from 'react'
import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'
import { useSortableTable } from '../hooks/useSortableTable'
import { SortableHeader } from '../components/SortableHeader'
import Chevron from '../components/Chevron'
import StatCard from '../components/StatCard'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const TYPE_ORDER = ['Mortgage', 'Auto', 'Student Loan', 'Credit Card', 'Personal', 'Other']

const TYPE_COLORS = {
  'Mortgage':     'text-blue-400 bg-blue-400/10',
  'Auto':         'text-amber-400 bg-amber-400/10',
  'Student Loan': 'text-purple-400 bg-purple-400/10',
  'Credit Card':  'text-red-400 bg-red-400/10',
  'Personal':     'text-slate-300 bg-slate-700',
  'Other':        'text-slate-400 bg-slate-700',
}

function equityColor(equity) {
  if (equity == null) return 'text-slate-600'
  return equity >= 0 ? 'text-emerald-400' : 'text-red-400'
}

export default function DebtsPage({ data, onSave, onDelete }) {
  const debtModal    = useEntityModal()
  const rewardsModal = useEntityModal()
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable('Balance', 'desc')
  const [collapsed, setCollapsed]   = useState(new Set())
  const [showRewards, setShowRewards] = useState(true)

  const toggleCollapse = (key) => setCollapsed(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const liabilities = (data?.Liabilities || []).filter(l => l.Active !== false && l.Active !== 0)
  const rewards      = data?.CreditCardRewards || []

  const totalDebt       = liabilities.reduce((s, l) => s + (Number(l.Balance)    || 0), 0)
  const totalAssetValue = liabilities.reduce((s, l) => s + (Number(l.AssetValue) || 0), 0)
  const netEquity       = totalAssetValue - totalDebt

  const totalRewardsValue = rewards.reduce((s, r) => {
    return s + ((Number(r.Points) || 0) * (Number(r.CentsPerPoint) || 0) / 100)
  }, 0)

  const byType = liabilities.reduce((acc, l) => {
    const t = l.Type || 'Other'
    if (!acc[t]) acc[t] = []
    acc[t].push(l)
    return acc
  }, {})

  const sortedTypes = Object.keys(byType).sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a)
    const bi = TYPE_ORDER.indexOf(b)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })

  async function handleDebtSubmit(row)    { await onSave('Liabilities', row, row._rowIndex == null); debtModal.close() }
  async function handleDebtDelete(row)    { await onDelete('Liabilities', row._rowIndex); debtModal.close() }
  async function handleRewardsSubmit(row) { await onSave('CreditCardRewards', row, row._rowIndex == null); rewardsModal.close() }
  async function handleRewardsDelete(row) { await onDelete('CreditCardRewards', row._rowIndex); rewardsModal.close() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Debts &amp; Liabilities</h2>
        <button onClick={() => debtModal.openAdd({ Active: true })} className="btn-primary">
          + Add Debt
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="stat-label">Total Debt</p>
          <p className="text-3xl font-bold text-red-400 mt-2 tabular-nums">{fmtCurrency.format(totalDebt)}</p>
          <p className="text-slate-600 text-xs mt-1">{liabilities.length} active {liabilities.length === 1 ? 'debt' : 'debts'}</p>
        </div>
        <StatCard label="Secured Asset Value" value={fmtCurrency.format(totalAssetValue)} sub="Value of collateral on secured debts" />
        <div className="card p-5">
          <p className="stat-label">Net Equity</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${netEquity >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netEquity >= 0 ? '+' : ''}{fmtCurrency.format(netEquity)}
          </p>
          <p className="text-slate-600 text-xs mt-1">Asset value minus all debt</p>
        </div>
      </div>

      {/* Debt groups */}
      {liabilities.length === 0 ? (
        <div className="card p-6">
          <p className="text-slate-500 text-sm">No active debts tracked. Click &ldquo;Add Debt&rdquo; to get started.</p>
        </div>
      ) : sortedTypes.map(type => {
        const group      = applySort(byType[type])
        const groupTotal = group.reduce((s, l) => s + (Number(l.Balance) || 0), 0)
        const colorCls   = TYPE_COLORS[type] ?? TYPE_COLORS.Other
        const isCollapsed = collapsed.has(type)

        return (
          <div key={type} className="card overflow-hidden">
            <button
              className="collapsible-btn"
              onClick={() => toggleCollapse(type)}
            >
              <div className="flex items-center gap-2">
                <span className={`badge ${colorCls}`}>{type}</span>
                <span className="text-slate-500 text-sm">{group.length} {group.length === 1 ? 'debt' : 'debts'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-400 font-medium tabular-nums text-sm">{fmtCurrency.format(groupTotal)}</span>
                <Chevron open={!isCollapsed} />
              </div>
            </button>

            {!isCollapsed && (
              <div className="section-body">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="th-row">
                      <SortableHeader col="Name"         label="Name"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                      <SortableHeader col="Lender"       label="Lender"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                      <SortableHeader col="Balance"      label="Balance"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                      <SortableHeader col="InterestRate" label="Rate"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                      <SortableHeader col="MinPayment"   label="Min / Mo"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                      <SortableHeader col="AssetValue"   label="Asset Value"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                      <th className="text-right text-slate-400 pb-2 text-xs font-semibold uppercase tracking-wide">Equity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map(l => {
                      const balance   = Number(l.Balance)    || 0
                      const assetVal  = Number(l.AssetValue) || 0
                      const equity    = assetVal > 0 ? assetVal - balance : null
                      return (
                        <tr
                          key={l.ID ?? l._rowIndex}
                          className="table-row"
                          onClick={() => debtModal.openEdit(l)}
                        >
                          <td className="py-3 pr-4 text-slate-200 font-medium">{l.Name}</td>
                          <td className="py-3 pr-4 text-slate-400">{l.Lender || '—'}</td>
                          <td className="py-3 pr-4 text-right text-red-400 font-medium tabular-nums">{fmtCurrency.format(balance)}</td>
                          <td className="py-3 pr-4 text-right text-slate-400 tabular-nums">{l.InterestRate ? `${Number(l.InterestRate).toFixed(2)}%` : '—'}</td>
                          <td className="py-3 pr-4 text-right text-slate-400 tabular-nums">{l.MinPayment ? fmtCurrency.format(l.MinPayment) : '—'}</td>
                          <td className="py-3 pr-4 text-right text-slate-300 tabular-nums">{assetVal > 0 ? fmtCurrency.format(assetVal) : '—'}</td>
                          <td className={`py-3 text-right text-xs font-medium tabular-nums ${equityColor(equity)}`}>
                            {equity != null ? `${equity >= 0 ? '+' : ''}${fmtCurrency.format(equity)}` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {/* Credit Card Rewards */}
      <div className="card">
        <button
          className="w-full flex items-center justify-between px-6 py-4"
          onClick={() => setShowRewards(v => !v)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-300 font-medium text-sm">Credit Card Rewards</span>
            {rewards.length > 0 && (
              <span className="text-slate-500 text-sm">{rewards.length} {rewards.length === 1 ? 'card' : 'cards'}</span>
            )}
            {totalRewardsValue > 0 && (
              <span className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-0.5 rounded-full tabular-nums">
                {fmtCurrency.format(totalRewardsValue)} est. value
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              role="button"
              onClick={e => { e.stopPropagation(); rewardsModal.openAdd({ CentsPerPoint: 1 }) }}
              className="text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add
            </span>
            <Chevron open={showRewards} />
          </div>
        </button>

        {showRewards && (
          <div className="border-t border-slate-700 px-6 pb-5">
            {rewards.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No rewards tracked. Add a card to track points and miles, and estimate their travel value.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr className="th-row text-slate-400">
                      <th className="text-left pb-2 pr-4">Card</th>
                      <th className="text-left pb-2 pr-4">Reward Program</th>
                      <th className="text-right pb-2 pr-4">Points / Miles</th>
                      <th className="text-right pb-2 pr-4">¢ / Point</th>
                      <th className="text-right pb-2 pr-4">Est. Value</th>
                      <th className="text-right pb-2">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map(r => {
                      const pts      = Number(r.Points) || 0
                      const cpp      = Number(r.CentsPerPoint) || 0
                      const estValue = pts * cpp / 100
                      return (
                        <tr
                          key={r.ID ?? r._rowIndex}
                          className="table-row"
                          onClick={() => rewardsModal.openEdit(r)}
                        >
                          <td className="py-2.5 pr-4 text-slate-200 font-medium">{r.CardName}</td>
                          <td className="py-2.5 pr-4 text-slate-400 text-xs">{r.RewardProgram || '—'}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-200 tabular-nums font-medium">{pts.toLocaleString()}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-400 tabular-nums">{cpp ? `${cpp}¢` : '—'}</td>
                          <td className="py-2.5 pr-4 text-right text-emerald-400 tabular-nums font-medium">
                            {estValue > 0 ? fmtCurrency.format(estValue) : '—'}
                          </td>
                          <td className="py-2.5 text-right text-slate-500 text-xs">{fmtDate(r.ExpirationDate)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={debtModal.open} onClose={debtModal.close} title={debtModal.isEditing ? 'Edit Debt' : 'Add Debt'}>
        <EntityForm
          schema={SCHEMAS.Liabilities}
          initialValues={debtModal.editRow}
          data={data}
          isEditing={debtModal.isEditing}
          onSubmit={handleDebtSubmit}
          onCancel={debtModal.close}
          onDelete={debtModal.isEditing ? () => handleDebtDelete(debtModal.editRow) : undefined}
        />
      </Modal>

      <Modal open={rewardsModal.open} onClose={rewardsModal.close} title={rewardsModal.isEditing ? 'Edit Card Rewards' : 'Add Card Rewards'}>
        <EntityForm
          schema={SCHEMAS.CreditCardRewards}
          initialValues={rewardsModal.editRow}
          data={data}
          isEditing={rewardsModal.isEditing}
          onSubmit={handleRewardsSubmit}
          onCancel={rewardsModal.close}
          onDelete={rewardsModal.isEditing ? () => handleRewardsDelete(rewardsModal.editRow) : undefined}
        />
      </Modal>
    </div>
  )
}
