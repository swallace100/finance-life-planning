import { useState } from "react";
import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtYear = (d) => (d ? new Date(d).getFullYear() : null);

// ── Awards ────────────────────────────────────────────────────────────────────

const AWARD_CATEGORY_STYLE = {
  Work:      { badge: "text-blue-400 bg-blue-400/10",     icon: "💼" },
  School:    { badge: "text-amber-400 bg-amber-400/10",   icon: "🎓" },
  Sports:    { badge: "text-emerald-400 bg-emerald-400/10", icon: "🏆" },
  Volunteer: { badge: "text-purple-400 bg-purple-400/10", icon: "🤝" },
  Personal:  { badge: "text-pink-400 bg-pink-400/10",     icon: "⭐" },
  Other:     { badge: "text-slate-400 bg-slate-700",      icon: "🏅" },
};

// ── Milestones ────────────────────────────────────────────────────────────────

const MILESTONE_CATEGORY_STYLE = {
  Family:    { bar: "bg-purple-500",  badge: "text-purple-400 bg-purple-400/10" },
  Travel:    { bar: "bg-sky-500",     badge: "text-sky-400 bg-sky-400/10" },
  Career:    { bar: "bg-blue-500",    badge: "text-blue-400 bg-blue-400/10" },
  Education: { bar: "bg-amber-500",   badge: "text-amber-400 bg-amber-400/10" },
  Health:    { bar: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-400/10" },
  Personal:  { bar: "bg-pink-500",    badge: "text-pink-400 bg-pink-400/10" },
  Other:     { bar: "bg-slate-500",   badge: "text-slate-400 bg-slate-700" },
};

function MilestoneTimeline({ milestones, onEdit }) {
  // Group by year, sorted descending
  const byYear = {};
  milestones.forEach((m) => {
    const yr = fmtYear(m.Date) ?? "Unknown";
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(m);
  });
  const years = Object.keys(byYear).sort((a, b) => b - a);

  if (years.length === 0) {
    return <p className="text-slate-500 text-sm">No milestones recorded yet.</p>;
  }

  return (
    <div className="space-y-8">
      {years.map((yr) => (
        <div key={yr}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{yr}</p>
          <div className="space-y-3 pl-4 border-l border-slate-700">
            {byYear[yr]
              .sort((a, b) => new Date(b.Date) - new Date(a.Date))
              .map((m) => {
                const st = MILESTONE_CATEGORY_STYLE[m.Category] ?? MILESTONE_CATEGORY_STYLE.Other;
                return (
                  <div
                    key={m.ID ?? m._rowIndex}
                    onClick={() => onEdit(m)}
                    className="relative cursor-pointer group"
                  >
                    {/* Timeline dot */}
                    <span className={`absolute -left-[1.3125rem] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${st.bar}`} />
                    <div className="card p-4 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-slate-100 font-medium">{m.Title}</p>
                          {m.Notes && (
                            <p className="text-slate-500 text-xs mt-1">{m.Notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${st.badge}`}>
                            {m.Category}
                          </span>
                          <span className="text-slate-500 text-xs whitespace-nowrap">
                            {fmtDate(m.Date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AchievementsPage({ data, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState("awards");
  const awardModal = useEntityModal();
  const milestoneModal = useEntityModal();
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable("AwardDate", "desc");

  const awards = data?.Awards || [];
  const milestones = data?.Milestones || [];

  const awardsSorted = applySort(awards);

  async function handleAwardSubmit(row) {
    await onSave("Awards", row, row._rowIndex == null);
    awardModal.close();
  }
  async function handleAwardDelete(row) {
    await onDelete("Awards", row._rowIndex);
    awardModal.close();
  }
  async function handleMilestoneSubmit(row) {
    await onSave("Milestones", row, row._rowIndex == null);
    milestoneModal.close();
  }
  async function handleMilestoneDelete(row) {
    await onDelete("Milestones", row._rowIndex);
    milestoneModal.close();
  }

  const TABS = [
    { id: "awards",     label: "Awards",     count: awards.length },
    { id: "milestones", label: "Milestones", count: milestones.length },
  ];

  const rowHover =
    "border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Achievements</h2>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === t.id
                ? "bg-slate-700 text-slate-100 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
            <span
              className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
                activeTab === t.id
                  ? "bg-slate-600 text-slate-300"
                  : "bg-slate-700/50 text-slate-500"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Awards tab ── */}
      {activeTab === "awards" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-300 font-medium">Awards &amp; Honors</p>
            <button
              onClick={() => awardModal.openAdd()}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              + Add Award
            </button>
          </div>

          {awardsSorted.length === 0 ? (
            <p className="text-slate-500 text-sm">No awards recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                    <SortableHeader col="Title"     label="Award"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Category"  label="Category"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Issuer"    label="Issuer"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="AwardDate" label="Date"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {awardsSorted.map((a) => {
                    const st = AWARD_CATEGORY_STYLE[a.Category] ?? AWARD_CATEGORY_STYLE.Other;
                    return (
                      <tr
                        key={a.ID ?? a._rowIndex}
                        className={rowHover}
                        onClick={() => awardModal.openEdit(a)}
                      >
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{st.icon}</span>
                            <span className="text-slate-100 font-medium">{a.Title}</span>
                          </div>
                          {a.Notes && (
                            <p className="text-slate-500 text-xs mt-0.5 pl-7">{a.Notes}</p>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${st.badge}`}>
                            {a.Category}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400 text-xs">{a.Issuer || "—"}</td>
                        <td className="py-2.5 text-right text-slate-400 text-xs whitespace-nowrap">
                          {fmtDate(a.AwardDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Milestones tab ── */}
      {activeTab === "milestones" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-300 font-medium">Life Milestones</p>
            <button
              onClick={() => milestoneModal.openAdd()}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              + Add Milestone
            </button>
          </div>
          <MilestoneTimeline
            milestones={milestones}
            onEdit={(m) => milestoneModal.openEdit(m)}
          />
        </div>
      )}

      <Modal
        open={awardModal.open}
        onClose={awardModal.close}
        title={awardModal.isEditing ? "Edit Award" : "Add Award"}
      >
        <EntityForm
          schema={SCHEMAS.Awards}
          initialValues={awardModal.editRow}
          data={data}
          isEditing={awardModal.isEditing}
          onSubmit={handleAwardSubmit}
          onCancel={awardModal.close}
          onDelete={awardModal.isEditing ? () => handleAwardDelete(awardModal.editRow) : undefined}
        />
      </Modal>

      <Modal
        open={milestoneModal.open}
        onClose={milestoneModal.close}
        title={milestoneModal.isEditing ? "Edit Milestone" : "Add Milestone"}
      >
        <EntityForm
          schema={SCHEMAS.Milestones}
          initialValues={milestoneModal.editRow}
          data={data}
          isEditing={milestoneModal.isEditing}
          onSubmit={handleMilestoneSubmit}
          onCancel={milestoneModal.close}
          onDelete={milestoneModal.isEditing ? () => handleMilestoneDelete(milestoneModal.editRow) : undefined}
        />
      </Modal>
    </div>
  );
}
