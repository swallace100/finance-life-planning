// Shared net-worth / asset computations, used by the Finance dashboard,
// the launcher tiles, the Collections overview, and the Goals page.

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getLatestValueByAsset(assetHistory) {
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

export function stillOwned(asset) {
  return asset.StillHave !== false && asset.StillHave !== 0
}

// Returns the parts so callers can show the collections rollup without recomputing.
export function computeNetWorthParts(data) {
  const latestByAsset = getLatestValueByAsset(data?.AssetHistory || [])
  const nonTangible   = Object.values(latestByAsset).reduce((s, h) => s + (Number(h.Value) || 0), 0)
  const tangible      = (data?.TangibleAssets  || []).filter(stillOwned).reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
  const digital       = (data?.DigitalAssets   || []).filter(stillOwned).reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
  const liabilities   = (data?.Liabilities     || [])
    .filter(l => l.Active === true || l.Active === 1 || l.Active === 'Yes')
    .reduce((s, l) => s + (Number(l.Balance) || 0), 0)
  return {
    netWorth: nonTangible + tangible + digital - liabilities,
    nonTangible,
    tangible,
    digital,
    liabilities,
  }
}

export function computeNetWorth(data) {
  return computeNetWorthParts(data).netWorth
}

export function computeMonthlyNetWorth(data) {
  const monthly = {}
  ;(data?.AssetHistory || []).forEach(h => {
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

export function computeAssetBreakdown(data) {
  const latestByAsset = getLatestValueByAsset(data?.AssetHistory || [])
  const byType = {}

  const CASH_TYPES = new Set(['Bank', 'Credit Union'])
  ;(data?.NonTangibleAssets || []).forEach(asset => {
    const h = latestByAsset[asset.ID]
    if (h) {
      const raw = asset.Type || 'Other'
      const type = CASH_TYPES.has(raw) ? 'Bank & Credit Union' : raw
      byType[type] = (byType[type] || 0) + (Number(h.Value) || 0)
    }
  })

  const { tangible, digital } = computeNetWorthParts(data)
  if (tangible > 0) byType['Tangible'] = tangible
  if (digital  > 0) byType['Digital']  = digital

  return Object.entries(byType).map(([name, value]) => ({ name, value }))
}
