import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'
import { useSortableTable } from '../hooks/useSortableTable'
import { SortableHeader } from '../components/SortableHeader'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const isActive = item => item.Active === 'Yes' || item.Active === true || item.Active === 1

export default function BudgetPage({ data, onSave, onDelete }) {
  const modal = useEntityModal()
  const incomeSort  = useSortableTable('Amount', 'desc')
  const expenseSort = useSortableTable('Amount', 'asc')
  const allItems = data?.Budget || []
  const items = allItems.filter(isActive)

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

  async function handleSubmit(row) {
    await onSave('Budget', row, row._rowIndex == null)
    modal.close()
  }

  async function handleDelete(row) {
    await onDelete('Budget', row._rowIndex)
    modal.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Budget</h2>
        <button
          onClick={() => modal.openAdd({ Active: 'Yes', Frequency: 'Monthly' })}
          className="btn-primary"
        >
          + Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="stat-label">Monthly Income</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 tabular-nums">{fmtCurrency.format(monthlyIncome)}</p>
        </div>
        <div className="card p-5">
          <p className="stat-label">Monthly Expenses</p>
          <p className="text-3xl font-bold text-red-400 mt-2 tabular-nums">{fmtCurrency.format(Math.abs(monthlyExpenses))}</p>
        </div>
        <div className="card p-5">
          <p className="stat-label">Net Monthly</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${netMonthly >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netMonthly >= 0 ? '+' : ''}{fmtCurrency.format(netMonthly)}
          </p>
        </div>
      </div>

      {/* Income */}
      {income.length > 0 && (
        <div className="card p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-slate-300 font-medium">Income</h3>
            <span className="text-emerald-400 text-sm tabular-nums font-medium">{fmtCurrency.format(monthlyIncome)}/mo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="th-row">
                  <SortableHeader col="Name"      label="Name"      sortKey={incomeSort.sortKey} sortDir={incomeSort.sortDir} onSort={incomeSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Type"      label="Type"      sortKey={incomeSort.sortKey} sortDir={incomeSort.sortDir} onSort={incomeSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Frequency" label="Frequency" sortKey={incomeSort.sortKey} sortDir={incomeSort.sortDir} onSort={incomeSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Amount"    label="Amount"    sortKey={incomeSort.sortKey} sortDir={incomeSort.sortDir} onSort={incomeSort.handleSort} align="right" className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {incomeSort.applySort(income).map((i, idx) => (
                  <tr
                    key={i.ID ?? idx}
                    className="table-row"
                    onClick={() => modal.openEdit(i)}
                  >
                    <td className="py-3 pr-4 text-slate-200">{i.Name}</td>
                    <td className="py-3 pr-4 text-slate-400">{i.Type}</td>
                    <td className="py-3 pr-4 text-slate-400">{i.Frequency}</td>
                    <td className="py-3 text-right font-medium tabular-nums text-emerald-400">{fmtCurrency.format(i.Amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses grouped by Type */}
      {Object.entries(expensesByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, rows]) => {
        const typeTotal = rows.reduce((s, i) => s + (Number(i.Amount) || 0), 0)
        return (
          <div key={type} className="card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-slate-300 font-medium">{type}</h3>
              <span className="text-red-400 text-sm tabular-nums font-medium">{fmtCurrency.format(Math.abs(typeTotal))}/mo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="th-row">
                    <SortableHeader col="Name"      label="Name"      sortKey={expenseSort.sortKey} sortDir={expenseSort.sortDir} onSort={expenseSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Frequency" label="Frequency" sortKey={expenseSort.sortKey} sortDir={expenseSort.sortDir} onSort={expenseSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Amount"    label="Amount"    sortKey={expenseSort.sortKey} sortDir={expenseSort.sortDir} onSort={expenseSort.handleSort} align="right" className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {expenseSort.applySort(rows).map((i, idx) => (
                    <tr
                      key={i.ID ?? idx}
                      className="table-row"
                      onClick={() => modal.openEdit(i)}
                    >
                      <td className="py-3 pr-4 text-slate-200">{i.Name}</td>
                      <td className="py-3 pr-4 text-slate-400">{i.Frequency}</td>
                      <td className="py-3 text-right tabular-nums text-slate-300">{fmtCurrency.format(Math.abs(i.Amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="card p-6">
          <p className="text-slate-500 text-sm">No budget items found.</p>
        </div>
      )}

      <Modal open={modal.open} onClose={modal.close} title={modal.isEditing ? 'Edit Budget Item' : 'Add Budget Item'}>
        <EntityForm
          schema={SCHEMAS.Budget}
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
