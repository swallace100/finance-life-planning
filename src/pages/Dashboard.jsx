import NetWorthCard from '../components/NetWorthCard'
import NetWorthChart from '../components/NetWorthChart'
import AssetBreakdown from '../components/AssetBreakdown'
import FinancialGoals from '../components/FinancialGoals'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLatestValueByAsset(assetHistory) {
  const latest = {}
  assetHistory.forEach(h => {
    const key = h.AssetID
    const ex = latest[key]
    if (!ex || new Date(h.Date) > new Date(ex.Date)) {
      latest[key] = h
    }
  })
  return latest
}

function isActive(cd) {
  return !!cd.Active
}

function stillOwned(asset) {
  return asset.StillHave !== false && asset.StillHave !== 0
}

function computeNetWorth(data) {
  const latestByAsset = getLatestValueByAsset(data.AssetHistory || [])
  const nonTangible = Object.values(latestByAsset).reduce((s, h) => s + (Number(h.Value) || 0), 0)
  const cds       = (data.CDs           || []).filter(isActive).reduce((s, c)     => s + (Number(c.FaceValue)     || 0), 0)
  const tangible  = (data.TangibleAssets || []).filter(stillOwned).reduce((s, t)  => s + (Number(t.CurrentValue)  || 0), 0)
  const digital   = (data.DigitalAssets  || []).filter(stillOwned).reduce((s, t)  => s + (Number(t.CurrentValue)  || 0), 0)
  return nonTangible + cds + tangible + digital
}

function computeMonthlyNetWorth(data) {
  const monthly = {}
  ;(data.AssetHistory || []).forEach(h => {
    const d = new Date(h.Date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly[key] = (monthly[key] || 0) + (Number(h.Value) || 0)
  })
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [year, month] = key.split('-')
      return { label: `${MONTH_LABELS[parseInt(month) - 1]} '${year.slice(2)}`, value }
    })
}

function computeAssetBreakdown(data) {
  const latestByAsset = getLatestValueByAsset(data.AssetHistory || [])
  const byType = {}

  const CASH_TYPES = new Set(['Bank', 'Credit Union'])
  ;(data.NonTangibleAssets || []).forEach(asset => {
    const h = latestByAsset[asset.ID]
    if (h) {
      const raw = asset.Type || 'Other'
      const type = CASH_TYPES.has(raw) ? 'Bank & Credit Union' : raw
      byType[type] = (byType[type] || 0) + (Number(h.Value) || 0)
    }
  })

  const cdTotal      = (data.CDs           || []).filter(isActive).reduce((s, c)    => s + (Number(c.FaceValue)    || 0), 0)
  const tangibleTotal = (data.TangibleAssets || []).filter(stillOwned).reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
  const digitalTotal  = (data.DigitalAssets  || []).filter(stillOwned).reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)

  if (cdTotal      > 0) byType['CD']      = cdTotal
  if (tangibleTotal > 0) byType['Tangible'] = tangibleTotal
  if (digitalTotal  > 0) byType['Digital']  = digitalTotal

  return Object.entries(byType).map(([name, value]) => ({ name, value }))
}


export default function Dashboard({ data, onSave, onDelete }) {
  if (!data) return null

  const netWorth    = computeNetWorth(data)
  const monthlyData = computeMonthlyNetWorth(data)
  const breakdown   = computeAssetBreakdown(data)
  const goals       = data.FinancialGoals || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NetWorthCard total={netWorth} />
        </div>
        <div className="lg:col-span-2">
          <AssetBreakdown breakdown={breakdown} total={netWorth} />
        </div>
      </div>

      <NetWorthChart data={monthlyData} />

      <FinancialGoals goals={goals} netWorth={netWorth} onSave={onSave} onDelete={onDelete} />
    </div>
  )
}
