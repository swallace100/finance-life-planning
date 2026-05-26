import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const rowHover = 'border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors'

function SectionHeader({ title, sub, onAdd, addLabel }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div className="flex items-baseline gap-3">
        <h3 className="text-slate-300 font-medium">{title}</h3>
        {sub && <span className="text-slate-400 text-sm tabular-nums">{sub}</span>}
      </div>
      <button
        onClick={onAdd}
        className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        + {addLabel}
      </button>
    </div>
  )
}

export default function RetirementPage({ data, onSave }) {
  const scheduleModal   = useEntityModal()
  const holdingsModal   = useEntityModal()
  const allocationModal = useEntityModal()

  const schedule   = data?.RetirementSchedule || []
  const holdings   = data?.RetirementHoldings || []
  const allocation = data?.FundAllocation     || []
  const assets     = data?.NonTangibleAssets  || []

  const assetMap = Object.fromEntries(assets.map(a => [a.ID, a]))
  const currentYear = new Date().getFullYear()

  const totalExpectedYearly = schedule.reduce((s, r) => s + (Number(r.ExpectedYearlyAmount) || 0), 0)

  async function handleScheduleSubmit(row) {
    await onSave('RetirementSchedule', row, row._rowIndex == null)
    scheduleModal.close()
  }

  async function handleHoldingsSubmit(row) {
    await onSave('RetirementHoldings', row, row._rowIndex == null)
    holdingsModal.close()
  }

  async function handleAllocationSubmit(row) {
    await onSave('FundAllocation', row, row._rowIndex == null)
    allocationModal.close()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Retirement</h2>

      {/* Schedule */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <SectionHeader
          title="Schedule"
          sub={schedule.length > 0 ? `${fmtCurrency.format(totalExpectedYearly)}/yr total` : null}
          onAdd={() => scheduleModal.openAdd()}
          addLabel="Add Entry"
        />

        {schedule.length === 0 ? (
          <p className="text-slate-500 text-sm">No retirement schedule entries found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Account</th>
                <th className="text-right pb-2 pr-4">Accessible Year</th>
                <th className="text-right pb-2 pr-4">Years Away</th>
                <th className="text-right pb-2 pr-4">Expected / Year</th>
                <th className="text-left pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {schedule
                .slice()
                .sort((a, b) => (a.AccessibleYear ?? 0) - (b.AccessibleYear ?? 0))
                .map(r => {
                  const asset = r.AssetID ? assetMap[r.AssetID] : null
                  const yearsAway = r.AccessibleYear ? r.AccessibleYear - currentYear : null
                  const accessible = yearsAway !== null && yearsAway <= 0
                  return (
                    <tr key={r.ID ?? r._rowIndex} className={rowHover} onClick={() => scheduleModal.openEdit(r)}>
                      <td className="py-3 pr-4 text-slate-200">
                        {asset ? asset.Name : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">{r.AccessibleYear ?? '—'}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {yearsAway === null ? '—' : accessible
                          ? <span className="text-emerald-400 font-medium">Accessible</span>
                          : <span className="text-slate-400">in {yearsAway} yrs</span>
                        }
                      </td>
                      <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">
                        {r.ExpectedYearlyAmount ? fmtCurrency.format(r.ExpectedYearlyAmount) : '—'}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">{r.Notes || ''}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Holdings */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <SectionHeader
          title="Holdings"
          onAdd={() => holdingsModal.openAdd()}
          addLabel="Add Holding"
        />

        {holdings.length === 0 ? (
          <p className="text-slate-500 text-sm">No retirement holdings recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Account</th>
                <th className="text-left pb-2 pr-4">Fund</th>
                <th className="text-left pb-2 pr-4">Ticker</th>
                <th className="text-right pb-2 pr-4">%</th>
                <th className="text-left pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={h.ID ?? i} className={rowHover} onClick={() => holdingsModal.openEdit(h)}>
                  <td className="py-3 pr-4 text-slate-400">{h.AssetID ? (assetMap[h.AssetID]?.Name ?? h.AssetID) : '—'}</td>
                  <td className="py-3 pr-4 text-slate-200">{h.FundName}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">{h.Ticker}</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">{h.Percentage}%</td>
                  <td className="py-3 text-slate-500 text-xs">{h.Notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fund Allocation */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <SectionHeader
          title="Fund Allocation"
          onAdd={() => allocationModal.openAdd()}
          addLabel="Add Allocation"
        />

        {allocation.length === 0 ? (
          <p className="text-slate-500 text-sm">No fund allocation recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                <th className="text-left pb-2 pr-4">Holding ID</th>
                <th className="text-left pb-2 pr-4">Asset Class</th>
                <th className="text-right pb-2">%</th>
              </tr>
            </thead>
            <tbody>
              {allocation.map((a, i) => (
                <tr key={a.ID ?? i} className={rowHover} onClick={() => allocationModal.openEdit(a)}>
                  <td className="py-3 pr-4 text-slate-400">{a.HoldingID}</td>
                  <td className="py-3 pr-4 text-slate-200">{a.AssetClass}</td>
                  <td className="py-3 text-slate-300 text-right tabular-nums">{a.Percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={scheduleModal.open} onClose={scheduleModal.close} title={scheduleModal.isEditing ? 'Edit Schedule Entry' : 'Add Schedule Entry'}>
        <EntityForm
          schema={SCHEMAS.RetirementSchedule}
          initialValues={scheduleModal.editRow}
          data={data}
          isEditing={scheduleModal.isEditing}
          onSubmit={handleScheduleSubmit}
          onCancel={scheduleModal.close}
        />
      </Modal>

      <Modal open={holdingsModal.open} onClose={holdingsModal.close} title={holdingsModal.isEditing ? 'Edit Holding' : 'Add Holding'}>
        <EntityForm
          schema={SCHEMAS.RetirementHoldings}
          initialValues={holdingsModal.editRow}
          data={data}
          isEditing={holdingsModal.isEditing}
          onSubmit={handleHoldingsSubmit}
          onCancel={holdingsModal.close}
        />
      </Modal>

      <Modal open={allocationModal.open} onClose={allocationModal.close} title={allocationModal.isEditing ? 'Edit Allocation' : 'Add Allocation'}>
        <EntityForm
          schema={SCHEMAS.FundAllocation}
          initialValues={allocationModal.editRow}
          data={data}
          isEditing={allocationModal.isEditing}
          onSubmit={handleAllocationSubmit}
          onCancel={allocationModal.close}
        />
      </Modal>
    </div>
  )
}
