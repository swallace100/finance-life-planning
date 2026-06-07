import { useState } from 'react'
import Modal from './Modal'
import EntityForm from './EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'

const STATUS_STYLES = {
  'Goal Met': 'text-emerald-400 bg-emerald-400/10',
  'On Track': 'text-blue-400 bg-blue-400/10',
  'At Risk':  'text-red-400 bg-red-400/10',
}

export default function FinancialGoals({ goals, netWorth, onSave, onDelete }) {
  const modal = useEntityModal()

  async function handleSubmit(row) {
    await onSave('FinancialGoals', row, row._rowIndex == null)
    modal.close()
  }
  async function handleDelete(row) {
    await onDelete('FinancialGoals', row._rowIndex)
    modal.close()
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-slate-300 font-medium">Financial Goals</h2>
        <button
          onClick={() => modal.openAdd()}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {!goals?.length ? (
        <p className="text-slate-500 text-sm">No financial goals yet.</p>
      ) : (
        <div className="space-y-5">
          {goals.map((goal, i) => {
            const target   = Number(goal.TargetAmount)
            const met      = goal.Status === 'Goal Met' || netWorth >= target
            const progress = met ? 100 : Math.min((netWorth / target) * 100, 100)

            return (
              <div
                key={goal.ID ?? i}
                className="cursor-pointer group"
                onClick={() => modal.openEdit(goal)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors">
                    {goal.Name}
                  </span>
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
      )}

      <Modal
        open={modal.open}
        onClose={modal.close}
        title={modal.isEditing ? 'Edit Financial Goal' : 'Add Financial Goal'}
      >
        <EntityForm
          schema={SCHEMAS.FinancialGoals}
          initialValues={modal.editRow}
          isEditing={modal.isEditing}
          onSubmit={handleSubmit}
          onCancel={modal.close}
          onDelete={modal.isEditing ? () => handleDelete(modal.editRow) : undefined}
        />
      </Modal>
    </div>
  )
}
