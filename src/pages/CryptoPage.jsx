import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";
import StatCard from "../components/StatCard";

const fmtCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtQty = (v) => v != null ? Number(v).toLocaleString("en-US", { maximumFractionDigits: 8 }) : "—";

const fmtDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const fmtPct = (v) => (v ? `${Number(v).toFixed(2)}%` : "—");

function Badge({ children, color = "slate" }) {
  const colors = {
    green: "text-emerald-400 bg-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    slate: "text-slate-400 bg-slate-400/10",
  };
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export default function CryptoPage({ data, onSave, onDelete }) {
  const modal = useEntityModal();
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable(
    "Name",
    "asc",
  );
  const assets = data?.CryptoAssets || [];
  const staked = assets.filter((asset) => asset.Staked);
  const totalValue = assets.reduce((s, a) => s + (Number(a.Value) || 0), 0);

  async function handleSubmit(row) {
    await onSave("CryptoAssets", row, row._rowIndex == null);
    modal.close();
  }

  async function handleDelete(row) {
    await onDelete("CryptoAssets", row._rowIndex);
    modal.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Crypto Assets</h2>
        <button onClick={() => modal.openAdd()} className="btn-primary">
          + Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Value"  value={fmtCurrency.format(totalValue)} />
        <StatCard label="Holdings"     value={assets.length} sub={`${staked.length} staked`} />
        <StatCard label="Staking APY"  value={staked.length ? `${(staked.reduce((s, a) => s + (Number(a.StakingAPY) || 0), 0) / staked.length).toFixed(2)}%` : "—"} sub="avg across staked" />
      </div>

      <div className="card p-6">
        <h3 className="text-slate-300 font-medium mb-4">Holdings</h3>
        {assets.length === 0 ? (
          <p className="text-slate-500 text-sm">No crypto assets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="th-row">
                  <SortableHeader
                    col="Name"
                    label="Name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="pb-2 pr-4"
                  />
                  <SortableHeader
                    col="Ticker"
                    label="Ticker"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="pb-2 pr-4"
                  />
                  <SortableHeader
                    col="Wallet"
                    label="Wallet"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="pb-2 pr-4"
                  />
                  <SortableHeader
                    col="Quantity"
                    label="Coins"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="right"
                    className="pb-2 pr-4"
                  />
                  <SortableHeader
                    col="Value"
                    label="Value"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="right"
                    className="pb-2 pr-4"
                  />
                  <th className="text-left text-slate-400 pb-2 pr-4">
                    Staking
                  </th>
                  <SortableHeader
                    col="StakingAPY"
                    label="APY"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="right"
                    className="pb-2 pr-4"
                  />
                  <SortableHeader
                    col="UnlockDate"
                    label="Unlock Date"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="right"
                    className="pb-2"
                  />
                </tr>
              </thead>
              <tbody>
                {applySort(assets).map((a) => (
                  <tr
                    key={a.ID}
                    className="table-row"
                    onClick={() => modal.openEdit(a)}
                  >
                    <td className="py-3 pr-4 text-slate-200 font-medium">
                      {a.Name}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge color="purple">{a.Ticker}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {a.Wallet || "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">
                      {fmtQty(a.Quantity)}
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-right tabular-nums">
                      {a.Value != null ? fmtCurrency.format(a.Value) : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {a.Staked ? (
                        <Badge color="green">
                          {a.AutoRestake ? "Auto-restake" : "Staked"}
                        </Badge>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-right">
                      {a.Staked ? fmtPct(a.StakingAPY) : "—"}
                    </td>
                    <td className="py-3 text-slate-400 text-right">
                      {a.Staked ? fmtDate(a.UnlockDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {assets.some((a) => a.Notes) && (
        <div className="card p-6">
          <h3 className="text-slate-300 font-medium mb-3">Notes</h3>
          <div className="space-y-2">
            {assets
              .filter((a) => a.Notes)
              .map((a) => (
                <div key={a.ID} className="flex gap-3 text-sm">
                  <Badge color="purple">{a.Ticker}</Badge>
                  <span className="text-slate-400">{a.Notes}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={modal.close}
        title={modal.isEditing ? "Edit Crypto Asset" : "Add Crypto Asset"}
      >
        <EntityForm
          schema={SCHEMAS.CryptoAssets}
          initialValues={modal.editRow}
          data={data}
          isEditing={modal.isEditing}
          onSubmit={handleSubmit}
          onCancel={modal.close}
          onDelete={
            modal.isEditing ? () => handleDelete(modal.editRow) : undefined
          }
        />
      </Modal>
    </div>
  );
}
