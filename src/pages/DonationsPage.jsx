import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'
import { useSortableTable } from '../hooks/useSortableTable'
import { SortableHeader } from '../components/SortableHeader'
import StatCard from '../components/StatCard'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

export default function DonationsPage({ data, onSave, onDelete }) {
  const modal = useEntityModal()
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable('Date', 'desc')
  const donations = data?.Donations || []

  const byYear = donations.reduce((acc, d) => {
    const y = d.Year ?? new Date(d.Date).getFullYear()
    if (!acc[y]) acc[y] = []
    acc[y].push(d)
    return acc
  }, {})

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)
  const grandTotal = donations.reduce((s, d) => s + (Number(d.Amount) || 0), 0)

  const currentYear = new Date().getFullYear()

  async function handleSubmit(row) {
    await onSave('Donations', row, row._rowIndex == null)
    modal.close()
  }

  async function handleDelete(row) {
    await onDelete('Donations', row._rowIndex)
    modal.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Donations</h2>
        <button
          onClick={() => modal.openAdd({ Year: currentYear })}
          className="btn-primary"
        >
          + Add Donation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Donated" value={fmtCurrency.format(grandTotal)} sub="all time" />
        <StatCard label="This Year" value={fmtCurrency.format((byYear[years[0]] || []).reduce((s, d) => s + (Number(d.Amount) || 0), 0))} sub={years[0] != null ? String(years[0]) : undefined} />
        <StatCard label="Organizations" value={new Set(donations.map(d => d.Organization)).size} sub="all time" />
      </div>

      {donations.length === 0 ? (
        <div className="card p-6">
          <p className="text-slate-500 text-sm">No donations recorded.</p>
        </div>
      ) : years.map(year => {
        const rows = byYear[year]
        const yearTotal = rows.reduce((s, d) => s + (Number(d.Amount) || 0), 0)
        return (
          <div key={year} className="card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-slate-300 font-medium">{year}</h3>
              <span className="text-slate-400 text-sm tabular-nums">{fmtCurrency.format(yearTotal)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="th-row">
                    <SortableHeader col="Organization" label="Organization" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Amount"       label="Amount"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                    <SortableHeader col="Date"         label="Date"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                    <th className="text-left text-slate-400 pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {applySort(rows).map(d => (
                    <tr
                      key={d.ID ?? d._rowIndex}
                      className="table-row"
                      onClick={() => modal.openEdit(d)}
                    >
                      <td className="py-3 pr-4 text-slate-200">{d.Organization}</td>
                      <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">{fmtCurrency.format(d.Amount)}</td>
                      <td className="py-3 pr-4 text-slate-400 text-right">{fmtDate(d.Date)}</td>
                      <td className="py-3 text-slate-500 text-xs">{d.Notes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      <Modal open={modal.open} onClose={modal.close} title={modal.isEditing ? 'Edit Donation' : 'Add Donation'}>
        <EntityForm
          schema={SCHEMAS.Donations}
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
