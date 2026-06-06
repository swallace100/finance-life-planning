import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const rowHover =
  "border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors";

function SectionHeader({ title, sub, onAdd, addLabel }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div className="flex items-baseline gap-3">
        <h3 className="text-slate-300 font-medium">{title}</h3>
        {sub && (
          <span className="text-slate-400 text-sm tabular-nums">{sub}</span>
        )}
      </div>
      <button
        onClick={onAdd}
        className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export default function RetirementPage({ data, onSave, onDelete }) {
  const scheduleModal = useEntityModal();
  const holdingsModal = useEntityModal();
  const allocationModal = useEntityModal();
  const scheduleSort   = useSortableTable('AccessibleYear', 'asc');
  const holdingsSort   = useSortableTable('Percentage', 'desc');
  const allocationSort = useSortableTable('AssetClass', 'asc');

  const schedule = data?.RetirementSchedule || [];
  const holdings = data?.RetirementHoldings || [];
  const allocation = data?.FundAllocation || [];
  const assets = data?.NonTangibleAssets || [];

  const assetMap = Object.fromEntries(assets.map((a) => [a.ID, a]));
  const currentYear = new Date().getFullYear();

  // Latest account values for withdrawal rate calculation
  const latestByAsset = {};
  (data?.AssetHistory || []).forEach((h) => {
    const ex = latestByAsset[h.AssetID];
    if (!ex || new Date(h.Date) > new Date(ex.Date))
      latestByAsset[h.AssetID] = h;
  });
  const currentValue = (id) => Number(latestByAsset[id]?.Value) || 0;

  function projectedYearly(r) {
    if (r.WithdrawalRate != null && r.AssetID) {
      return currentValue(r.AssetID) * (Number(r.WithdrawalRate) / 100);
    }
    return Number(r.ExpectedYearlyAmount) || 0;
  }

  const totalProjectedYearly = schedule.reduce(
    (s, r) => s + projectedYearly(r),
    0,
  );
  const currentYearly = schedule
    .filter((r) => (r.AccessibleYear ?? 9999) <= currentYear)
    .reduce((s, r) => s + projectedYearly(r), 0);
  const accessibleCount = schedule.filter(
    (r) => (r.AccessibleYear ?? 9999) <= currentYear,
  ).length;

  async function handleScheduleSubmit(row) {
    await onSave("RetirementSchedule", row, row._rowIndex == null);
    scheduleModal.close();
  }

  async function handleScheduleDelete(row) {
    await onDelete("RetirementSchedule", row._rowIndex);
    scheduleModal.close();
  }

  async function handleHoldingsSubmit(row) {
    await onSave("RetirementHoldings", row, row._rowIndex == null);
    holdingsModal.close();
  }

  async function handleHoldingsDelete(row) {
    await onDelete("RetirementHoldings", row._rowIndex);
    holdingsModal.close();
  }

  async function handleAllocationSubmit(row) {
    await onSave("FundAllocation", row, row._rowIndex == null);
    allocationModal.close();
  }

  async function handleAllocationDelete(row) {
    await onDelete("FundAllocation", row._rowIndex);
    allocationModal.close();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Retirement</h2>

      {/* Schedule */}
      <div className="card p-6">
        <SectionHeader
          title="Retirement Income"
          onAdd={() => scheduleModal.openAdd({ WithdrawalRate: 4 })}
          addLabel="Add Entry"
        />

        {schedule.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Current — accessible now */}
            <div className="bg-slate-700/30 rounded-lg px-5 py-4 border border-slate-700">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Current Income
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-white tabular-nums">
                  {fmtCurrency.format(currentYearly)}
                </p>
                <span className="text-slate-400 text-sm">/yr</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <p className="text-lg font-semibold text-slate-300 tabular-nums">
                  {fmtCurrency.format(currentYearly / 12)}
                </p>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                {accessibleCount} of {schedule.length} source
                {schedule.length !== 1 ? "s" : ""} accessible now
              </p>
            </div>

            {/* Max — all sources accessible */}
            <div className="bg-slate-700/30 rounded-lg px-5 py-4 border border-slate-700">
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Max Projected
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-white tabular-nums">
                  {fmtCurrency.format(totalProjectedYearly)}
                </p>
                <span className="text-slate-400 text-sm">/yr</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <p className="text-lg font-semibold text-slate-300 tabular-nums">
                  {fmtCurrency.format(totalProjectedYearly / 12)}
                </p>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                when all {schedule.length} source
                {schedule.length !== 1 ? "s" : ""} are accessible
              </p>
            </div>
          </div>
        )}

        {schedule.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No retirement schedule entries found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                  <SortableHeader col="Source"         label="Source / Account" sortKey={scheduleSort.sortKey} sortDir={scheduleSort.sortDir} onSort={scheduleSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="AccessibleYear" label="Accessible"       sortKey={scheduleSort.sortKey} sortDir={scheduleSort.sortDir} onSort={scheduleSort.handleSort} align="right" className="pb-2 pr-4" />
                  <th className="text-right text-slate-400 pb-2 pr-4">Years Away</th>
                  <SortableHeader col="WithdrawalRate"       label="Rate"             sortKey={scheduleSort.sortKey} sortDir={scheduleSort.sortDir} onSort={scheduleSort.handleSort} align="right" className="pb-2 pr-4" />
                  <SortableHeader col="ExpectedYearlyAmount" label="Projected / Year"  sortKey={scheduleSort.sortKey} sortDir={scheduleSort.sortDir} onSort={scheduleSort.handleSort} align="right" className="pb-2 pr-4" />
                  <th className="text-right text-slate-400 pb-2 pr-4">/ Month</th>
                  <th className="text-left text-slate-400 pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {scheduleSort.applySort(schedule).map((r) => {
                    const label = r.AssetID
                      ? (assetMap[r.AssetID]?.Name ?? `Asset ${r.AssetID}`)
                      : r.Source || (
                          <span className="text-slate-500 italic">unnamed</span>
                        );
                    const yearsAway = r.AccessibleYear
                      ? r.AccessibleYear - currentYear
                      : null;
                    const accessible = yearsAway !== null && yearsAway <= 0;
                    const useRate = r.WithdrawalRate != null && r.AssetID;
                    const yearly = projectedYearly(r);
                    return (
                      <tr
                        key={r.ID ?? r._rowIndex}
                        className={rowHover}
                        onClick={() => scheduleModal.openEdit(r)}
                      >
                        <td className="py-3 pr-4 text-slate-200">
                          {label}
                          {!r.AssetID && (
                            <span className="ml-2 text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                              estimated
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">
                          {r.AccessibleYear ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {yearsAway === null ? (
                            "—"
                          ) : accessible ? (
                            <span className="text-emerald-400 font-medium">
                              Now
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {yearsAway} yrs
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {useRate ? (
                            <span className="text-blue-400">
                              {Number(r.WithdrawalRate).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-200 text-right font-medium tabular-nums">
                          {yearly > 0 ? fmtCurrency.format(yearly) : "—"}
                        </td>
                        <td className="py-3 pr-4 text-slate-400 text-right tabular-nums">
                          {yearly > 0 ? fmtCurrency.format(yearly / 12) : "—"}
                        </td>
                        <td className="py-3 text-slate-500 text-xs">
                          {r.Notes || ""}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Holdings */}
      <div className="card p-6">
        <SectionHeader
          title="Holdings"
          onAdd={() => holdingsModal.openAdd()}
          addLabel="Add Holding"
        />

        {holdings.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No retirement holdings recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                  <SortableHeader col="AssetID"    label="Account" sortKey={holdingsSort.sortKey} sortDir={holdingsSort.sortDir} onSort={holdingsSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="FundName"   label="Fund"    sortKey={holdingsSort.sortKey} sortDir={holdingsSort.sortDir} onSort={holdingsSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Ticker"     label="Ticker"  sortKey={holdingsSort.sortKey} sortDir={holdingsSort.sortDir} onSort={holdingsSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Percentage" label="%"       sortKey={holdingsSort.sortKey} sortDir={holdingsSort.sortDir} onSort={holdingsSort.handleSort} align="right" className="pb-2 pr-4" />
                  <th className="text-left text-slate-400 pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {holdingsSort.applySort(holdings).map((h, i) => (
                  <tr
                    key={h.ID ?? i}
                    className={rowHover}
                    onClick={() => holdingsModal.openEdit(h)}
                  >
                    <td className="py-3 pr-4 text-slate-400">
                      {h.AssetID ? (assetMap[h.AssetID]?.Name ?? h.AssetID) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">{h.FundName}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">
                        {h.Ticker}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">
                      {h.Percentage}%
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {h.Notes || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fund Allocation */}
      <div className="card p-6">
        <SectionHeader
          title="Fund Allocation"
          onAdd={() => allocationModal.openAdd()}
          addLabel="Add Allocation"
        />

        {allocation.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No fund allocation recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                  <SortableHeader col="HoldingID"  label="Holding"      sortKey={allocationSort.sortKey} sortDir={allocationSort.sortDir} onSort={allocationSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="AssetClass" label="Asset Class"  sortKey={allocationSort.sortKey} sortDir={allocationSort.sortDir} onSort={allocationSort.handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Percentage" label="%"            sortKey={allocationSort.sortKey} sortDir={allocationSort.sortDir} onSort={allocationSort.handleSort} align="right" className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {allocationSort.applySort(allocation).map((a, i) => (
                  <tr
                    key={a.ID ?? i}
                    className={rowHover}
                    onClick={() => allocationModal.openEdit(a)}
                  >
                    <td className="py-3 pr-4 text-slate-400">{a.HoldingID}</td>
                    <td className="py-3 pr-4 text-slate-200">{a.AssetClass}</td>
                    <td className="py-3 text-slate-300 text-right tabular-nums">
                      {a.Percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={scheduleModal.open}
        onClose={scheduleModal.close}
        title={
          scheduleModal.isEditing ? "Edit Schedule Entry" : "Add Schedule Entry"
        }
      >
        <EntityForm
          schema={SCHEMAS.RetirementSchedule}
          initialValues={scheduleModal.editRow}
          data={data}
          isEditing={scheduleModal.isEditing}
          onSubmit={handleScheduleSubmit}
          onCancel={scheduleModal.close}
          onDelete={
            scheduleModal.isEditing
              ? () => handleScheduleDelete(scheduleModal.editRow)
              : undefined
          }
        />
      </Modal>

      <Modal
        open={holdingsModal.open}
        onClose={holdingsModal.close}
        title={holdingsModal.isEditing ? "Edit Holding" : "Add Holding"}
      >
        <EntityForm
          schema={SCHEMAS.RetirementHoldings}
          initialValues={holdingsModal.editRow}
          data={data}
          isEditing={holdingsModal.isEditing}
          onSubmit={handleHoldingsSubmit}
          onCancel={holdingsModal.close}
          onDelete={
            holdingsModal.isEditing
              ? () => handleHoldingsDelete(holdingsModal.editRow)
              : undefined
          }
        />
      </Modal>

      <Modal
        open={allocationModal.open}
        onClose={allocationModal.close}
        title={allocationModal.isEditing ? "Edit Allocation" : "Add Allocation"}
      >
        <EntityForm
          schema={SCHEMAS.FundAllocation}
          initialValues={allocationModal.editRow}
          data={data}
          isEditing={allocationModal.isEditing}
          onSubmit={handleAllocationSubmit}
          onCancel={allocationModal.close}
          onDelete={
            allocationModal.isEditing
              ? () => handleAllocationDelete(allocationModal.editRow)
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
