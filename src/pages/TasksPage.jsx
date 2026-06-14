import { useState } from "react";
import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";
import Chevron from "../components/Chevron";

const CATEGORY_STYLE = {
  Work:     "text-blue-400 bg-blue-400/10",
  School:   "text-amber-400 bg-amber-400/10",
  Personal: "text-purple-400 bg-purple-400/10",
  Family:   "text-pink-400 bg-pink-400/10",
  Health:   "text-emerald-400 bg-emerald-400/10",
  Other:    "text-slate-400 bg-slate-700",
};

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

function TaskRow({ t, onClick }) {
  const days = daysUntil(t.DueDate);
  const isOverdue = days !== null && days < 0;
  const isSoon    = days !== null && days >= 0 && days <= 7;
  const pri = PRIORITY_STYLE[t.Priority] ?? PRIORITY_STYLE.Medium;

  let rowClass = "table-row";
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
    <tr key={t.ID ?? t._rowIndex} className={rowClass} onClick={() => onClick(t)}>
      <td className="py-3 pr-4 text-slate-200">{t.Name}</td>
      <td className="py-3 pr-4">
        {t.Category
          ? <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLE[t.Category] ?? CATEGORY_STYLE.Other}`}>{t.Category}</span>
          : <span className="text-slate-600">—</span>}
      </td>
      <td className="py-3 pr-4">
        <span className={`text-xs px-2 py-0.5 rounded-full ${pri.badge}`}>{t.Priority}</span>
      </td>
      <td className="py-3 pr-4 text-slate-400 text-right text-xs tabular-nums">{fmtDate(t.DueDate)}</td>
      <td className="py-3 pr-4 text-right">{statusEl}</td>
      <td className="py-3 text-slate-500 text-xs">{t.Notes || ""}</td>
    </tr>
  );
}

export default function TasksPage({ data, onSave, onDelete }) {
  const modal = useEntityModal();
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable("DueDate", "asc");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showDone, setShowDone] = useState(false);

  const tasks     = data?.Tasks || [];
  const openTasks = tasks.filter(t => t.Status !== 'Done');
  const doneTasks = tasks.filter(t => t.Status === 'Done');

  const categories = ["All", ...Array.from(new Set(openTasks.map(t => t.Category).filter(Boolean))).sort()];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = openTasks.filter(t => t.DueDate && new Date(t.DueDate) < today);
  const dueWeek = openTasks.filter(t => {
    if (!t.DueDate) return false;
    const d = new Date(t.DueDate);
    const diff = (d - today) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  const filtered = categoryFilter === "All" ? openTasks : openTasks.filter(t => t.Category === categoryFilter);
  const sorted = applySort(filtered);

  async function handleSubmit(row) {
    await onSave("Tasks", row, row._rowIndex == null);
    modal.close();
  }

  async function handleDelete(row) {
    await onDelete("Tasks", row._rowIndex);
    modal.close();
  }

  const tableHead = (
    <tr className="th-row">
      <SortableHeader col="Name"     label="Task"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="Category" label="Category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="Priority" label="Priority" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="DueDate"  label="Due Date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
      <th className="text-right text-slate-400 pb-2 pr-4">Status</th>
      <th className="text-left text-slate-400 pb-2">Notes</th>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Tasks</h2>
        <button
          onClick={() => modal.openAdd({ Priority: "Medium", Status: "Open" })}
          className="btn-primary"
        >
          + Add Task
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="stat-label">Open</p>
            <p className="stat-value">{openTasks.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-red-400 text-xs font-semibold uppercase tracking-wide">Overdue</p>
            <p className={`text-3xl font-bold mt-2 ${overdue.length > 0 ? "text-red-400" : "text-white"}`}>
              {overdue.length}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Due This Week</p>
            <p className={`text-3xl font-bold mt-2 ${dueWeek.length > 0 ? "text-amber-400" : "text-white"}`}>
              {dueWeek.length}
            </p>
          </div>
        </div>
      )}

      {categories.length > 2 && (
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="card p-6">
        {tasks.length === 0 ? (
          <p className="text-slate-500 text-sm">No tasks yet.</p>
        ) : sorted.length === 0 ? (
          <p className="text-slate-500 text-sm">No open tasks match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>{tableHead}</thead>
              <tbody>
                {sorted.map(t => (
                  <TaskRow key={t.ID ?? t._rowIndex} t={t} onClick={modal.openEdit} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {doneTasks.length > 0 && (
        <div className="card overflow-hidden">
          <button className="collapsible-btn" onClick={() => setShowDone(v => !v)}>
            <span className="text-slate-500 text-sm font-medium">Completed ({doneTasks.length})</span>
            <Chevron open={showDone} />
          </button>
          {showDone && (
            <div className="section-body">
              <table className="w-full text-sm">
                <thead>{tableHead}</thead>
                <tbody>
                  {doneTasks.map(t => (
                    <tr
                      key={t.ID ?? t._rowIndex}
                      className="table-row opacity-50"
                      onClick={() => modal.openEdit(t)}
                    >
                      <td className="py-3 pr-4 text-slate-400 line-through">{t.Name}</td>
                      <td className="py-3 pr-4">
                        {t.Category
                          ? <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLE[t.Category] ?? CATEGORY_STYLE.Other}`}>{t.Category}</span>
                          : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${(PRIORITY_STYLE[t.Priority] ?? PRIORITY_STYLE.Medium).badge}`}>{t.Priority}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-right text-xs tabular-nums">{fmtDate(t.DueDate)}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className="text-emerald-400 text-xs">Done</span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">{t.Notes || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
