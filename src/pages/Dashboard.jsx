import NetWorthCard from '../components/NetWorthCard'
import NetWorthChart from '../components/NetWorthChart'
import AssetBreakdown from '../components/AssetBreakdown'
import FinancialGoals from '../components/FinancialGoals'
import { computeNetWorthParts, computeMonthlyNetWorth, computeAssetBreakdown } from '../utils/netWorth'

export default function Dashboard({ data }) {
  if (!data) return null

  const { netWorth, tangible, digital } = computeNetWorthParts(data)
  const collectionsValue = tangible + digital
  const monthlyData = computeMonthlyNetWorth(data)
  const breakdown   = computeAssetBreakdown(data)
  const goals       = data.FinancialGoals || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NetWorthCard total={netWorth} />
          {collectionsValue > 0 && (
            <p className="text-slate-500 text-xs mt-2 px-1">
              Includes ${Math.round(collectionsValue).toLocaleString()} in collections (tangible + digital)
            </p>
          )}
        </div>
        <div className="lg:col-span-2">
          <AssetBreakdown breakdown={breakdown} total={netWorth} />
        </div>
      </div>

      <NetWorthChart data={monthlyData} />

      <FinancialGoals goals={goals} netWorth={netWorth} readOnly />
    </div>
  )
}
