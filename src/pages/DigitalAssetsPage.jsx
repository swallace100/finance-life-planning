import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'
import { useSortableTable } from '../hooks/useSortableTable'
import { SortableHeader } from '../components/SortableHeader'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function gainColor(cost, current) {
  if (cost == null || current == null) return 'text-slate-400'
  return current >= cost ? 'text-emerald-400' : 'text-red-400'
}

function gainLabel(cost, current) {
  if (cost == null || current == null) return '—'
  const diff = current - cost
  const pct = ((diff / cost) * 100).toFixed(1)
  return `${diff >= 0 ? '+' : ''}${fmtCurrency.format(diff)} (${pct}%)`
}

export default function DigitalAssetsPage({ data, onSave, onDelete }) {
  const modal = useEntityModal()
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable('CurrentValue', 'desc')
  const stillOwned = a => a.StillHave !== false && a.StillHave !== 0
  const assets = (data?.DigitalAssets || []).filter(stillOwned)

  const totalCost  = assets.reduce((s, a) => s + (Number(a.Cost)         || 0), 0)
  const totalValue = assets.reduce((s, a) => s + (Number(a.CurrentValue) || 0), 0)
  const totalGain  = totalValue - totalCost

  const byCategory = assets.reduce((acc, a) => {
    const c = a.Category || 'Other'
    if (!acc[c]) acc[c] = []
    acc[c].push(a)
    return acc
  }, {})

  async function handleSubmit(row) {
    await onSave('DigitalAssets', row, row._rowIndex == null)
    modal.close()
  }

  async function handleDelete(row) {
    await onDelete('DigitalAssets', row._rowIndex)
    modal.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Digital Assets</h2>
        <button
          onClick={() => modal.openAdd({ StillHave: true })}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          + Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Current Value</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">{fmtCurrency.format(totalValue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Cost</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">{fmtCurrency.format(totalCost)}</p>
        </div>
        <div className="card p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Unrealized Gain</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{fmtCurrency.format(totalGain)}
          </p>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="card p-6">
          <p className="text-slate-500 text-sm">No digital assets found.</p>
        </div>
      ) : Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, rows]) => (
        <div key={category} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 font-medium">{category}</h3>
            <span className="text-slate-500 text-sm">{rows.length} item{rows.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                  <SortableHeader col="Name"         label="Name"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Series"       label="Series"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Format"       label="Format"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Language"     label="Language"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="BuyDate"      label="Purchased" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                  <SortableHeader col="Cost"         label="Cost"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                  <SortableHeader col="CurrentValue" label="Value"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                  <th className="text-right text-slate-400 pb-2">Gain / Loss</th>
                </tr>
              </thead>
              <tbody>
                {applySort(rows).map(a => (
                  <tr
                    key={a.ID ?? a._rowIndex}
                    className="border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors"
                    onClick={() => modal.openEdit(a)}
                  >
                    <td className="py-3 pr-4 text-slate-200">
                      {a.Name}
                      {a.Author ? <span className="block text-xs text-slate-500">{a.Author}</span> : null}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{a.Series || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{a.Format || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{a.Language || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right">{fmtDate(a.BuyDate)}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right tabular-nums">{fmtCurrency.format(a.Cost)}</td>
                    <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">{fmtCurrency.format(a.CurrentValue)}</td>
                    <td className={`py-3 text-right text-xs font-medium tabular-nums ${gainColor(a.Cost, a.CurrentValue)}`}>
                      {gainLabel(a.Cost, a.CurrentValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Modal open={modal.open} onClose={modal.close} title={modal.isEditing ? 'Edit Digital Asset' : 'Add Digital Asset'}>
        <EntityForm
          schema={SCHEMAS.DigitalAssets}
          initialValues={modal.editRow}
          data={data}
          isEditing={modal.isEditing}
          onSubmit={handleSubmit}
          onCancel={modal.close}
          onDelete={modal.isEditing ? () => handleDelete(modal.editRow) : undefined}
        />
      </Modal>
    </div>
  )
}
