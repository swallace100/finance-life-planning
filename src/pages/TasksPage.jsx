import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";

const PRIORITY_STYLE = {
  High:   { badge: "text-red-400 bg-red-400/10",   dot: "bg-red-400",   order: 0 },
  Medium: { badge: "text-amber-400 bg-amber-400/10", dot: "bg-amber-400", order: 1 },
  Low:    { badge: "text-blue-400 bg-blue-400/10",  dot: "bg-blue-400",  order: 2 },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

const rowHover = "border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors";

export default function TasksPage({ data, onSave, onDelete }) {
  const modal = useEntityModal();
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable("DueDate", "asc");

  const tasks = data?.Tasks || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue  = tasks.filter(t => t.DueDate && new Date(t.DueDate) < today);
  const dueWeek  = tasks.filter(t => {
    if (!t.DueDate) return false;
    const d = new Date(t.DueDate);
    const diff = (d - today) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  const sorted = applySort(tasks);

  async function handleSubmit(row) {
    await onSave("Tasks", row, row._rowIndex == null);
    modal.close();
  }

  async function handleDelete(row) {
    await onDelete("Tasks", row._rowIndex);
    modal.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Tasks</h2>
        <button
          onClick={() => modal.openAdd({ Priority: "Medium" })}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          + Add Task
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total</p>
            <p className="text-3xl font-bold text-white mt-2">{tasks.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-red-400 text-xs font-semibold uppercase tracking-wide">Overdue</p>
            <p className={`text-3xl font-bold mt-2 ${overdue.length > 0 ? "text-red-400" : "text-white"}`}>
              {overdue.length}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Due This Week</p>
            <p className={`text-3xl font-bold mt-2 ${dueWeek.length > 0 ? "text-amber-400" : "text-white"}`}>
              {dueWeek.length}
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        {tasks.length === 0 ? (
          <p className="text-slate-500 text-sm">No tasks yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                <SortableHeader col="Name"     label="Task"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                <SortableHeader col="Priority" label="Priority" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                <SortableHeader col="DueDate"  label="Due Date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
                <th className="text-right text-slate-400 pb-2 pr-4">Status</th>
                <th className="text-left text-slate-400 pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(t => {
                const days = daysUntil(t.DueDate);
                const isOverdue = days !== null && days < 0;
                const isSoon    = days !== null && days >= 0 && days <= 7;
                const pri = PRIORITY_STYLE[t.Priority] ?? PRIORITY_STYLE.Medium;

                let rowClass = rowHover;
                if (isOverdue) rowClass += " bg-red-900/10";
                else if (isSoon) rowClass += " bg-amber-900/10";

                let statusEl;
                if (isOverdue) {
                  statusEl = <span className="text-red-400 font-medium text-xs">{Math.abs(days)}d overdue</span>;
                } else if (days === 0) {
                  statusEl = <span className="text-amber-400 font-medium text-xs">Today</span>;
                } else if (isSoon) {
                  statusEl = <span className="text-amber-400 text-xs">{days}d</span>;
                } else if (days !== null) {
                  statusEl = <span className="text-slate-500 text-xs">{days}d</span>;
                } else {
                  statusEl = <span className="text-slate-600">—</span>;
                }

                return (
                  <tr key={t.ID ?? t._rowIndex} className={rowClass} onClick={() => modal.openEdit(t)}>
                    <td className="py-3 pr-4 text-slate-200">{t.Name}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${pri.badge}`}>{t.Priority}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-right text-xs tabular-nums">{fmtDate(t.DueDate)}</td>
                    <td className="py-3 pr-4 text-right">{statusEl}</td>
                    <td className="py-3 text-slate-500 text-xs">{t.Notes || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal.open} onClose={modal.close} title={modal.isEditing ? "Edit Task" : "Add Task"}>
        <EntityForm
          schema={SCHEMAS.Tasks}
          initialValues={modal.editRow}
          data={data}
          isEditing={modal.isEditing}
          onSubmit={handleSubmit}
          onCancel={modal.close}
          onDelete={modal.isEditing ? () => handleDelete(modal.editRow) : undefined}
        />
      </Modal>
    </div>
  );
}
