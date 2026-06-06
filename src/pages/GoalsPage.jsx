import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";

const STATUS_STYLE = {
  Done:          { dot: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-400/10", border: "border-emerald-500/40" },
  "In Progress": { dot: "bg-amber-400",   badge: "text-amber-400 bg-amber-400/10",     border: "border-amber-400/40" },
  Planned:       { dot: "bg-blue-400",    badge: "text-blue-400 bg-blue-400/10",        border: "border-blue-400/30" },
  "Not Started": { dot: "bg-slate-500",   badge: "text-slate-400 bg-slate-700",         border: "border-slate-700" },
};

const TYPE_STYLE = {
  Technology: "text-blue-400 bg-blue-400/10",
  Japanese:   "text-amber-400 bg-amber-400/10",
  Humanities: "text-purple-400 bg-purple-400/10",
  Business:   "text-emerald-400 bg-emerald-400/10",
  Microsoft:  "text-cyan-400 bg-cyan-400/10",
  Other:      "text-slate-400 bg-slate-700",
};

const DIFF_STYLE = {
  Beginner:     "text-slate-400",
  Intermediate: "text-blue-400",
  Advanced:     "text-orange-400",
};

const STATUS_ORDER = ["In Progress", "Planned", "Not Started", "Done"];

function parseTargetDate(d) {
  if (!d) return Infinity;
  if (/^\d{4}$/.test(d)) return parseInt(d) * 12;
  const MONTHS = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };
  const m = d.match(/^([A-Z][a-z]{2})-(\d{2})$/);
  if (m) return (2000 + parseInt(m[2])) * 12 + (MONTHS[m[1]] ?? 0);
  return Infinity;
}

export default function GoalsPage({ data, onSave, onDelete }) {
  const lifetimeModal = useEntityModal();
  const educationModal = useEntityModal();
  const { sortKey: edSortKey, sortDir: edSortDir, handleSort: edHandleSort, applySort: edApplySort } = useSortableTable();

  const lifetime = data?.LifetimeGoals || [];
  const educationBase = (data?.EducationGoals || []).slice().sort((a, b) => {
    if (!!a.Done !== !!b.Done) return a.Done ? 1 : -1;
    return parseTargetDate(a.TargetDate) - parseTargetDate(b.TargetDate);
  });
  const education = edApplySort(educationBase);

  const lifetimeCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = lifetime.filter(g => g.Status === s).length;
    return acc;
  }, {});

  const edDone = education.filter(e => e.Done).length;
  const nextIdx = education.findIndex(e => !e.Done);

  const lifetimeSorted = lifetime.slice().sort((a, b) => {
    const oa = STATUS_ORDER.indexOf(a.Status);
    const ob = STATUS_ORDER.indexOf(b.Status);
    return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob);
  });

  async function handleLifetimeSubmit(row) {
    await onSave("LifetimeGoals", row, row._rowIndex == null);
    lifetimeModal.close();
  }
  async function handleLifetimeDelete(row) {
    await onDelete("LifetimeGoals", row._rowIndex);
    lifetimeModal.close();
  }
  async function handleEducationSubmit(row) {
    const isNew = row._rowIndex == null;
    const withOrder = {
      ...row,
      Order: isNew
        ? Math.max(0, ...education.map(e => e.Order ?? 0)) + 1
        : educationModal.editRow?.Order,
    };
    await onSave("EducationGoals", withOrder, isNew);
    educationModal.close();
  }
  async function handleEducationDelete(row) {
    await onDelete("EducationGoals", row._rowIndex);
    educationModal.close();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Goals</h2>

      {/* Lifetime Goals */}
      <div className="card p-6">
        <div className="flex items-baseline justify-between mb-5">
          <div className="flex items-baseline gap-3">
            <h3 className="text-slate-300 font-medium">Lifetime Goals</h3>
            <span className="text-slate-500 text-sm">{lifetime.length} total</span>
          </div>
          <button
            onClick={() => lifetimeModal.openAdd({ Status: "Not Started" })}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add Goal
          </button>
        </div>

        {/* Status summary */}
        {lifetime.length > 0 && (
          <div className="flex gap-3 mb-5 flex-wrap">
            {STATUS_ORDER.map(s => {
              const st = STATUS_STYLE[s];
              const count = lifetimeCounts[s];
              if (!count) return null;
              return (
                <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${st.border} bg-slate-700/30`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                  <span className="text-slate-300 text-xs">{s}</span>
                  <span className="text-slate-400 text-xs font-semibold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {lifetime.length === 0 ? (
          <p className="text-slate-500 text-sm">No lifetime goals recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lifetimeSorted.map(g => {
              const st = STATUS_STYLE[g.Status] ?? STATUS_STYLE["Not Started"];
              return (
                <div
                  key={g.ID ?? g._rowIndex}
                  onClick={() => lifetimeModal.openEdit(g)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer hover:bg-slate-700/40 transition-colors bg-slate-700/20 ${st.border}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${st.dot}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-200 text-sm leading-snug">{g.Goal}</span>
                    {g.Progress && (
                      <span className="ml-2 text-slate-500 text-xs tabular-nums">({g.Progress})</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${st.badge}`}>
                    {g.Status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Education Goals */}
      <div className="card p-6">
        <div className="flex items-baseline justify-between mb-5">
          <div className="flex items-baseline gap-3">
            <h3 className="text-slate-300 font-medium">Education & Certifications</h3>
            {education.length > 0 && (
              <span className="text-slate-500 text-sm">
                {edDone} / {education.length} complete
              </span>
            )}
          </div>
          <button
            onClick={() => educationModal.openAdd({ Order: education.length + 1, Done: false })}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add Entry
          </button>
        </div>

        {education.length === 0 ? (
          <p className="text-slate-500 text-sm">No education goals recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                <SortableHeader col="Name"       label="Name"       sortKey={edSortKey} sortDir={edSortDir} onSort={edHandleSort} className="pb-2 pr-4" />
                <SortableHeader col="Type"       label="Type"       sortKey={edSortKey} sortDir={edSortDir} onSort={edHandleSort} className="pb-2 pr-4" />
                <SortableHeader col="Difficulty" label="Difficulty" sortKey={edSortKey} sortDir={edSortDir} onSort={edHandleSort} className="pb-2 pr-4" />
                <SortableHeader col="Renewal"    label="Renewal"    sortKey={edSortKey} sortDir={edSortDir} onSort={edHandleSort} className="pb-2 pr-4" />
                <SortableHeader col="TargetDate" label="Target"     sortKey={edSortKey} sortDir={edSortDir} onSort={edHandleSort} align="right" className="pb-2 pr-4" />
                <th className="text-center text-slate-400 pb-2">Done</th>
              </tr>
            </thead>
            <tbody>
              {education.map((e, i) => {
                const isNext = i === nextIdx;
                const isDone = !!e.Done;
                const typeStyle = TYPE_STYLE[e.Type] ?? TYPE_STYLE.Other;
                const diffStyle = DIFF_STYLE[e.Difficulty] ?? "text-slate-400";

                let rowClass = "border-b border-slate-700/50 last:border-0 cursor-pointer transition-colors ";
                if (isDone) rowClass += "hover:bg-emerald-900/10";
                else if (isNext) rowClass += "bg-amber-400/5 hover:bg-amber-400/10";
                else rowClass += "hover:bg-slate-700/40";

                return (
                  <tr
                    key={e.ID ?? e._rowIndex}
                    className={rowClass}
                    onClick={() => educationModal.openEdit(e)}
                  >
                    <td className="py-3 pr-4">
                      <span className={isDone ? "text-slate-500 line-through" : isNext ? "text-slate-100 font-medium" : "text-slate-300"}>
                        {e.Name}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle}`}>{e.Type}</span>
                    </td>
                    <td className={`py-3 pr-4 text-xs ${diffStyle}`}>{e.Difficulty}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{e.Renewal || "—"}</td>
                    <td className="py-3 pr-4 text-slate-400 text-right tabular-nums text-xs">{e.TargetDate || "—"}</td>
                    <td className="py-3 text-center">
                      {isDone ? (
                        <span className="text-emerald-400">✓</span>
                      ) : isNext ? (
                        <span className="text-amber-400 text-xs font-medium">Next</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={lifetimeModal.open}
        onClose={lifetimeModal.close}
        title={lifetimeModal.isEditing ? "Edit Goal" : "Add Goal"}
      >
        <EntityForm
          schema={SCHEMAS.LifetimeGoals}
          initialValues={lifetimeModal.editRow}
          data={data}
          isEditing={lifetimeModal.isEditing}
          onSubmit={handleLifetimeSubmit}
          onCancel={lifetimeModal.close}
          onDelete={lifetimeModal.isEditing ? () => handleLifetimeDelete(lifetimeModal.editRow) : undefined}
        />
      </Modal>

      <Modal
        open={educationModal.open}
        onClose={educationModal.close}
        title={educationModal.isEditing ? "Edit Entry" : "Add Entry"}
      >
        <EntityForm
          schema={SCHEMAS.EducationGoals}
          initialValues={educationModal.editRow}
          data={data}
          isEditing={educationModal.isEditing}
          onSubmit={handleEducationSubmit}
          onCancel={educationModal.close}
          onDelete={educationModal.isEditing ? () => handleEducationDelete(educationModal.editRow) : undefined}
        />
      </Modal>
    </div>
  );
}
