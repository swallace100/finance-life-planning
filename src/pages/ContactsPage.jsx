import { useState } from "react";
import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";

const fmtBirthday = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function daysUntilBirthday(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const bday = new Date(dateStr);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next - today) / 86400000);
}

const RELATIONSHIP_STYLE = {
  Family:       "text-purple-400 bg-purple-400/10",
  Friend:       "text-blue-400 bg-blue-400/10",
  Colleague:    "text-teal-400 bg-teal-400/10",
  Acquaintance: "text-slate-400 bg-slate-700",
  Other:        "text-slate-400 bg-slate-700",
};

function StarIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export default function ContactsPage({ data, onSave, onDelete }) {
  const modal = useEntityModal();
  const [search, setSearch] = useState("");
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable("Name", "asc");

  const contacts = data?.Contacts || [];

  const filtered = search
    ? contacts.filter(
        (c) =>
          (c.Name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.Relationship ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.Email ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const sorted = applySort(filtered, (row, key) => {
    if (key === "Favorite") return row.Favorite ? 0 : 1;
    if (key === "Birthday") {
      const d = daysUntilBirthday(row.Birthday);
      return d ?? 9999;
    }
    return row[key];
  });

  const favorites = contacts.filter((c) => c.Favorite);
  const upcomingBirthdays = contacts
    .map((c) => ({ ...c, daysUntil: daysUntilBirthday(c.Birthday) }))
    .filter((c) => c.daysUntil !== null && c.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  async function handleSubmit(row) {
    await onSave("Contacts", row, row._rowIndex == null);
    modal.close();
  }
  async function handleDelete(row) {
    await onDelete("Contacts", row._rowIndex);
    modal.close();
  }

  const rowHover =
    "border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Contacts</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-white mt-2">{contacts.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Favorites</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{favorites.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide">Birthdays This Month</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{upcomingBirthdays.length}</p>
        </div>
      </div>

      {/* Upcoming birthdays banner */}
      {upcomingBirthdays.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-400 mb-3">
            Upcoming Birthdays (next 30 days)
          </p>
          <div className="flex flex-wrap gap-3">
            {upcomingBirthdays.map((c) => (
              <div
                key={c.ID ?? c._rowIndex}
                className="flex items-center gap-2 bg-purple-400/10 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-purple-400/20 transition-colors"
                onClick={() => modal.openEdit(c)}
              >
                <span className="text-sm text-slate-200 font-medium">{c.Name}</span>
                <span className="text-xs text-purple-400">
                  {c.daysUntil === 0 ? "Today!" : `in ${c.daysUntil}d`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main contacts card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, relationship, email…"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">✕</button>
            )}
          </div>
          <button
            onClick={() => modal.openAdd()}
            className="flex-shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            + Add Contact
          </button>
        </div>

        {search && (
          <p className="text-slate-500 text-xs mb-3">{filtered.length} of {contacts.length} contacts</p>
        )}

        {sorted.length === 0 ? (
          <p className="text-slate-500 text-sm">{search ? "No matches." : "No contacts yet."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                  <SortableHeader col="Favorite"     label=""             sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-3 w-6" />
                  <SortableHeader col="Name"         label="Name"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Relationship" label="Relationship" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Phone"        label="Phone"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Email"        label="Email"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Social"       label="Social"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
                  <SortableHeader col="Birthday"     label="Birthday"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => {
                  const days = daysUntilBirthday(c.Birthday);
                  const birthdaySoon = days !== null && days <= 30;
                  return (
                    <tr
                      key={c.ID ?? c._rowIndex}
                      className={rowHover}
                      onClick={() => modal.openEdit(c)}
                    >
                      <td className="py-2.5 pr-3">
                        <StarIcon filled={!!c.Favorite} />
                      </td>
                      <td className="py-2.5 pr-4 text-slate-100 font-medium whitespace-nowrap">{c.Name}</td>
                      <td className="py-2.5 pr-4">
                        {c.Relationship ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${RELATIONSHIP_STYLE[c.Relationship] ?? "text-slate-400 bg-slate-700"}`}>
                            {c.Relationship}
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs whitespace-nowrap">{c.Phone || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs">{c.Email || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs">{c.Social || "—"}</td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {c.Birthday ? (
                          <span className={birthdaySoon ? "text-purple-400 font-medium text-xs" : "text-slate-400 text-xs"}>
                            {fmtBirthday(c.Birthday)}
                            {birthdaySoon && <span className="ml-1 text-purple-500">({days === 0 ? "today" : `${days}d`})</span>}
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={modal.close}
        title={modal.isEditing ? "Edit Contact" : "Add Contact"}
      >
        <EntityForm
          schema={SCHEMAS.Contacts}
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
