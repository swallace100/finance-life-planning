import { useState, Fragment } from "react";
import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const fmtPct = (v) => (v != null ? `${v.toFixed(1)}%` : "—");

const CLASS_ORDER = ["Cash", "Bonds/CDs/Treasuries", "Stock", "Other"];

function getLatestByAsset(history) {
  const latest = {};
  history.forEach((h) => {
    const ex = latest[h.AssetID];
    if (!ex || new Date(h.Date) > new Date(ex.Date)) latest[h.AssetID] = h;
  });
  return latest;
}

function computeTree(data) {
  const assets = data?.NonTangibleAssets || [];
  const history = data?.AssetHistory || [];
  const cds = data?.CDs || [];
  const holdings = data?.RetirementHoldings || [];
  const fundAllocs = data?.FundAllocation || [];
  const tangibles = data?.TangibleAssets || [];
  const goals = data?.AssetGoals || [];

  const latestByAsset = getLatestByAsset(history);
  const acctVal = (id) => Number(latestByAsset[id]?.Value) || 0;

  const classGoals = {}; // 'Cash' → 10
  const subGoals = {}; // 'Cash::USD' → 100
  const subToClass = {}; // 'USD' → 'Cash'  (used to route FundAllocation.AssetClass to parent class)
  goals.forEach((g) => {
    if (g.Subclass) {
      subGoals[`${g.AssetClass}::${g.Subclass}`] = Number(g.GoalPct);
      subToClass[g.Subclass] = g.AssetClass;
    } else {
      classGoals[g.AssetClass] = Number(g.GoalPct);
    }
  });

  const tree = {};
  function add(cls, sub, val) {
    if (!val || val <= 0) return;
    if (!tree[cls]) tree[cls] = {};
    tree[cls][sub] = (tree[cls][sub] || 0) + val;
  }

  // Bank and Credit Union accounts → Cash, grouped by currency
  const CASH_TYPES = new Set(["Bank", "Credit Union"]);
  assets
    .filter((a) => CASH_TYPES.has(a.Type))
    .forEach((a) => {
      const curr = a.Currency || "USD";
      if (!tree["Cash"]) tree["Cash"] = {};
      tree["Cash"][curr] = (tree["Cash"][curr] || 0) + acctVal(a.ID);
    });

  // Active CDs → Bonds/CDs/Treasuries > Certificate Deposit
  cds
    .filter(
      (cd) => cd.Active !== false && cd.Active !== 0 && cd.Active !== "No",
    )
    .forEach((cd) => {
      add("Bonds/CDs/Treasuries", "Certificate Deposit", Number(cd.FaceValue) || 0);
    });

  // Investment/Retirement/HSA/Stock/Bond accounts with FundAllocation data
  const accountsWithHoldings = new Set(holdings.map((h) => h.AssetID));
  const holdingValues = {};
  holdings.forEach((h) => {
    const hId = h.ID ?? h._rowIndex;
    holdingValues[hId] = acctVal(h.AssetID) * (Number(h.Percentage) / 100);
  });
  fundAllocs.forEach((alloc) => {
    const val =
      (holdingValues[alloc.HoldingID] || 0) * (Number(alloc.Percentage) / 100);
    const cls = subToClass[alloc.AssetClass] || "Stock";
    add(cls, alloc.AssetClass, val);
  });

  // Accounts with no holdings data — default class depends on type
  const INVESTMENT_LIKE = new Set(["Investment", "Retirement", "HSA", "Stock"]);
  const BOND_LIKE = new Set([
    "Bond",
    "Bonds",
    "Certificate Deposit",
    "Treasuries",
  ]);
  assets
    .filter(
      (a) => INVESTMENT_LIKE.has(a.Type) && !accountsWithHoldings.has(a.ID),
    )
    .forEach((a) => {
      add("Stock", a.Subtype || a.Name, acctVal(a.ID));
    });
  assets
    .filter((a) => BOND_LIKE.has(a.Type) && !accountsWithHoldings.has(a.ID))
    .forEach((a) => {
      add("Bonds/CDs/Treasuries", a.Subtype || a.Name, acctVal(a.ID));
    });

  // Crypto accounts → Other > Subtype/Name
  assets
    .filter((a) => a.Type === "Crypto")
    .forEach((a) => {
      add("Other", a.Subtype || a.Name, acctVal(a.ID));
    });

  // Tangible assets → Other > Category
  tangibles
    .filter((a) => a.StillHave !== false && a.StillHave !== 0)
    .forEach((a) => {
      add("Other", a.Category || "Other", Number(a.CurrentValue) || 0);
    });

  let total = 0;
  Object.values(tree).forEach((subs) =>
    Object.values(subs).forEach((v) => {
      total += v;
    }),
  );

  return { tree, total, classGoals, subGoals };
}

function gapCls(actual, goal) {
  if (goal == null) return "text-slate-500";
  const d = Math.abs(actual - goal);
  if (d <= 2) return "text-emerald-400";
  if (d <= 7) return "text-amber-400";
  return "text-red-400";
}

function Gap({ actual, goal }) {
  if (goal == null) return <span className="text-slate-700">—</span>;
  const diff = actual - goal;
  const cls =
    Math.abs(diff) <= 2
      ? "text-emerald-400"
      : Math.abs(diff) <= 7
        ? "text-amber-400"
        : "text-red-400";
  return (
    <span className={`tabular-nums ${cls}`}>
      {diff >= 0 ? "+" : ""}
      {diff.toFixed(1)}
    </span>
  );
}

export default function AllocationPage({ data, onSave, onDelete }) {
  const goalsModal = useEntityModal();
  const [showGoals, setShowGoals] = useState(false);

  const { tree, total, classGoals, subGoals } = computeTree(data);
  const goals = data?.AssetGoals || [];

  const hasFundAllocationGap =
    (data?.RetirementHoldings?.length || 0) > 0 &&
    (data?.FundAllocation?.length || 0) === 0;

  const classes = Object.keys(tree).sort((a, b) => {
    const ai = CLASS_ORDER.indexOf(a);
    const bi = CLASS_ORDER.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  async function handleGoalSubmit(row) {
    await onSave("AssetGoals", row, row._rowIndex == null);
    goalsModal.close();
  }

  async function handleGoalDelete(row) {
    await onDelete("AssetGoals", row._rowIndex);
    goalsModal.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Allocation</h2>
          {total > 0 && (
            <p className="text-slate-500 text-sm mt-0.5">
              {fmtCurrency.format(total)} tracked across all sources
            </p>
          )}
        </div>
      </div>

      {hasFundAllocationGap && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3">
          <p className="text-amber-400 text-sm font-medium">
            FundAllocation data needed for full stock breakdown
          </p>
          <p className="text-amber-400/70 text-xs mt-0.5">
            You have retirement holdings but no fund allocations. Add entries to
            FundAllocation on the Retirement page to break stocks down by asset
            class.
          </p>
        </div>
      )}

      {/* Main allocation table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide bg-slate-900/40">
              <th className="text-left px-6 py-3 w-1/3">Asset Class</th>
              <th className="text-right px-4 py-3">Class %</th>
              <th className="text-right px-4 py-3">Subclass %</th>
              <th className="text-right px-4 py-3">Goal</th>
              <th className="text-right px-4 py-3">Sub Goal</th>
              <th className="text-right px-6 py-3">Gap</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => {
              const subs = tree[cls];
              const classTotal = Object.values(subs).reduce((s, v) => s + v, 0);
              const classPct = total > 0 ? (classTotal / total) * 100 : 0;
              const classGoal = classGoals[cls];
              const sortedSubs = Object.entries(subs).sort(
                ([, a], [, b]) => b - a,
              );

              return (
                <Fragment key={cls}>
                  <tr className="border-b border-slate-600 bg-slate-700/20">
                    <td className="px-6 py-3 font-semibold text-slate-100">
                      {cls}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      <span className={gapCls(classPct, classGoal)}>
                        {fmtPct(classPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">—</td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">
                      {classGoal != null ? `${classGoal}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">—</td>
                    <td className="px-6 py-3 text-right text-xs">
                      <Gap actual={classPct} goal={classGoal} />
                    </td>
                  </tr>

                  {sortedSubs.map(([sub, val]) => {
                    const subPct =
                      classTotal > 0 ? (val / classTotal) * 100 : 0;
                    const subGoal = subGoals[`${cls}::${sub}`];
                    return (
                      <tr
                        key={sub}
                        className="border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="pl-10 pr-6 py-2.5 text-slate-400">
                          {sub}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-700">
                          —
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">
                          {fmtPct(subPct)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-700">
                          —
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums">
                          {subGoal != null ? `${subGoal}%` : "—"}
                        </td>
                        <td className="px-6 py-2.5 text-right text-xs">
                          <Gap actual={subPct} goal={subGoal} />
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}

            {classes.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  No allocation data found. Connect your Excel file to see your
                  portfolio breakdown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Goals Configuration — collapsible */}
      <div className="card">
        <button
          className="w-full flex items-center justify-between px-6 py-4"
          onClick={() => setShowGoals((v) => !v)}
        >
          <span className="text-slate-300 font-medium text-sm">
            Goals Configuration
            {goals.length > 0 && (
              <span className="ml-2 text-slate-500 font-normal">
                {goals.length} entries
              </span>
            )}
          </span>
          <div className="flex items-center gap-3">
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                goalsModal.openAdd();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Goal
            </span>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${showGoals ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {showGoals && (
          <div className="border-t border-slate-700 px-6 pb-5">
            {goals.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No goals configured. Add entries to see how your actual
                allocation compares to targets. Leave Subclass blank for a
                class-level goal (e.g. "Stock = 65%"), or fill it in for a
                within-class target (e.g. "US Stocks = 60% of Stock").
              </p>
            ) : (
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    <th className="text-left pb-2 pr-4">Asset Class</th>
                    <th className="text-left pb-2 pr-4">Subclass</th>
                    <th className="text-right pb-2">Goal %</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((g) => (
                    <tr
                      key={g.ID ?? g._rowIndex}
                      className="border-b border-slate-700/30 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors"
                      onClick={() => goalsModal.openEdit(g)}
                    >
                      <td className="py-2.5 pr-4 text-slate-200">
                        {g.AssetClass}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-400">
                        {g.Subclass || (
                          <span className="text-slate-600 italic text-xs">
                            class level
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-slate-300 tabular-nums">
                        {g.GoalPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <Modal
        open={goalsModal.open}
        onClose={goalsModal.close}
        title={goalsModal.isEditing ? "Edit Goal" : "Add Goal"}
      >
        <EntityForm
          schema={SCHEMAS.AssetGoals}
          initialValues={goalsModal.editRow}
          data={data}
          isEditing={goalsModal.isEditing}
          onSubmit={handleGoalSubmit}
          onCancel={goalsModal.close}
          onDelete={
            goalsModal.isEditing
              ? () => handleGoalDelete(goalsModal.editRow)
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
