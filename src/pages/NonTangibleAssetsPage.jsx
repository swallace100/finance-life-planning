import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const TYPE_ORDER = ['Bank', 'Investment', 'Retirement', 'Crypto', 'Other']
const TYPE_COLORS = {
  Bank:       'text-blue-400 bg-blue-400/10',
  Investment: 'text-emerald-400 bg-emerald-400/10',
  Retirement: 'text-amber-400 bg-amber-400/10',
  Crypto:     'text-purple-400 bg-purple-400/10',
  Other:      'text-slate-400 bg-slate-700',
}

function getLatestByAsset(history) {
  const latest = {}
  history.forEach(h => {
    const ex = latest[h.AssetID]
    if (!ex || new Date(h.Date) > new Date(ex.Date)) latest[h.AssetID] = h
  })
  return latest
}

export default function NonTangibleAssetsPage({ data, onSave }) {
  const accountModal = useEntityModal()
  const historyModal = useEntityModal()

  const assets  = data?.NonTangibleAssets || []
  const history = data?.AssetHistory      || []

  const latestByAsset = getLatestByAsset(history)

  const rows = assets.map(a => ({
    ...a,
    latestValue: Number(latestByAsset[a.ID]?.Value) || null,
    latestDate:  latestByAsset[a.ID]?.Date ?? null,
  }))

  const total = rows.reduce((s, r) => s + (r.latestValue ?? 0), 0)
  const retirementCount = rows.filter(r => r.RetirementAccount).length

  const byType = rows.reduce((acc, r) => {
    const t = r.Type || 'Other'
    if (!acc[t]) acc[t] = []
    acc[t].push(r)
    return acc
  }, {})

  const sortedTypes = Object.keys(byType).sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a); const bi = TYPE_ORDER.indexOf(b)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })

  async function handleAccountSubmit(row) {
    await onSave('NonTangibleAssets', row, !accountModal.isEditing)
    accountModal.close()
  }

  async function handleHistorySubmit(row) {
    await onSave('AssetHistory', row, !historyModal.isEditing)
    historyModal.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Accounts &amp; Holdings</h2>
        <button
          onClick={() => accountModal.openAdd({ Currency: 'USD' })}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          + Add Account
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Value</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">{fmtCurrency.format(total)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Accounts</p>
          <p className="text-3xl font-bold text-white mt-2">{rows.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Retirement Accounts</p>
          <p className="text-3xl font-bold text-white mt-2">{retirementCount}</p>
        </div>
      </div>

      {sortedTypes.map(type => {
        const group = byType[type].slice().sort((a, b) => (b.latestValue ?? 0) - (a.latestValue ?? 0))
        const groupTotal = group.reduce((s, r) => s + (r.latestValue ?? 0), 0)
        const colorClass = TYPE_COLORS[type] ?? TYPE_COLORS.Other

        return (
          <div key={type} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${colorClass}`}>{type}</span>
                <span className="text-slate-500 text-sm">{group.length} account{group.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-slate-300 font-medium tabular-nums text-sm">{fmtCurrency.format(groupTotal)}</span>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left pb-2 pr-4">Name</th>
                  <th className="text-left pb-2 pr-4">Subtype</th>
                  <th className="text-left pb-2 pr-4">Institution</th>
                  <th className="text-left pb-2 pr-4">Currency</th>
                  <th className="text-right pb-2 pr-4">Latest Value</th>
                  <th className="text-right pb-2 pr-4">As Of</th>
                  <th className="text-right pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {group.map(r => (
                  <tr
                    key={r.ID}
                    className="border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors"
                    onClick={() => accountModal.openEdit(r)}
                  >
                    <td className="py-3 pr-4 text-slate-200">
                      {r.Name}
                      {r.RetirementAccount && (
                        <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Retirement</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{r.Subtype || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{r.Institution || '—'}</td>
                    <td className="py-3 pr-4 text-slate-500">{r.Currency || '—'}</td>
                    <td className="py-3 pr-4 text-right font-medium tabular-nums text-slate-200">
                      {r.latestValue != null ? fmtCurrency.format(r.latestValue) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-500 text-xs">{fmtDate(r.latestDate)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); historyModal.openAdd({ AssetID: r.ID }) }}
                        className="text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2 py-1 rounded transition-colors"
                      >
                        + Value
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {rows.length === 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-500 text-sm">No accounts found.</p>
        </div>
      )}

      <Modal open={accountModal.open} onClose={accountModal.close} title={accountModal.isEditing ? 'Edit Account' : 'Add Account'}>
        <EntityForm
          schema={SCHEMAS.NonTangibleAssets}
          initialValues={accountModal.editRow}
          data={data}
          isEditing={accountModal.isEditing}
          onSubmit={handleAccountSubmit}
          onCancel={accountModal.close}
        />
      </Modal>

      <Modal open={historyModal.open} onClose={historyModal.close} title={historyModal.isEditing ? 'Edit Value Entry' : 'Add Value Entry'}>
        <EntityForm
          schema={SCHEMAS.AssetHistory}
          initialValues={historyModal.editRow}
          data={data}
          isEditing={historyModal.isEditing}
          onSubmit={handleHistorySubmit}
          onCancel={historyModal.close}
        />
      </Modal>
    </div>
  )
}
