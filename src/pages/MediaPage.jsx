import { useState } from "react";
import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { useSortableTable } from "../hooks/useSortableTable";
import { SortableHeader } from "../components/SortableHeader";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

function Stars({ rating }) {
  if (!rating) return <span className="text-slate-600">—</span>;
  return (
    <span className="text-amber-400 tabular-nums text-xs font-medium">
      ★ {Number(rating).toFixed(rating % 1 === 0 ? 0 : 1)}
    </span>
  );
}

const STATUS_STYLE = {
  Completed: "text-emerald-400 bg-emerald-400/10",
  Playing:   "text-blue-400 bg-blue-400/10",
  Abandoned: "text-red-400 bg-red-400/10",
  Backlog:   "text-slate-400 bg-slate-700",
};

const FORMAT_STYLE = {
  Physical:  "text-amber-400 bg-amber-400/10",
  Ebook:     "text-blue-400 bg-blue-400/10",
  Audiobook: "text-purple-400 bg-purple-400/10",
};

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
          ✕
        </button>
      )}
    </div>
  );
}

const rowHover = "border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/40 transition-colors";

export default function MediaPage({ data, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState("books");
  const [search, setSearch] = useState({ books: "", films: "", games: "" });
  const bookModal = useEntityModal();
  const filmModal = useEntityModal();
  const gameModal = useEntityModal();
  const bookSort = useSortableTable("ReadDate", "desc");
  const filmSort = useSortableTable("WatchDate", "desc");
  const gameSort = useSortableTable("CompletionDate", "desc");

  const books = data?.ReadingLog || [];
  const films = data?.FilmLog || [];
  const games = data?.GamingLog || [];

  function setTabSearch(tab, val) {
    setSearch(prev => ({ ...prev, [tab]: val }));
  }

  const q = (s) => s.toLowerCase();
  const filteredBooks = search.books
    ? books.filter(b => q(b.Name ?? "").includes(q(search.books)) || q(b.Author ?? "").includes(q(search.books)) || q(b.Genre ?? "").includes(q(search.books)))
    : books;
  const filteredFilms = search.films
    ? films.filter(f => q(f.Name ?? "").includes(q(search.films)) || String(f.ReleaseYear ?? "").includes(search.films))
    : films;
  const filteredGames = search.games
    ? games.filter(g => q(g.Name ?? "").includes(q(search.games)) || q(g.Platform ?? "").includes(q(search.games)) || q(g.Genre ?? "").includes(q(search.games)))
    : games;

  const booksSorted = bookSort.applySort(filteredBooks);
  const filmsSorted = filmSort.applySort(filteredFilms);
  const gamesSorted = gameSort.applySort(filteredGames);

  async function handleBookSubmit(row) {
    await onSave("ReadingLog", row, row._rowIndex == null);
    bookModal.close();
  }
  async function handleBookDelete(row) {
    await onDelete("ReadingLog", row._rowIndex);
    bookModal.close();
  }
  async function handleFilmSubmit(row) {
    await onSave("FilmLog", row, row._rowIndex == null);
    filmModal.close();
  }
  async function handleFilmDelete(row) {
    await onDelete("FilmLog", row._rowIndex);
    filmModal.close();
  }
  async function handleGameSubmit(row) {
    await onSave("GamingLog", row, row._rowIndex == null);
    gameModal.close();
  }
  async function handleGameDelete(row) {
    await onDelete("GamingLog", row._rowIndex);
    gameModal.close();
  }

  const TABS = [
    { id: "books", label: "Books", count: books.length },
    { id: "films", label: "Films", count: films.length },
    { id: "games", label: "Games", count: games.length },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Media</h2>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-fit">
        {TABS.map(t => (
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
            <span className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${activeTab === t.id ? "bg-slate-600 text-slate-300" : "bg-slate-700/50 text-slate-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Books */}
      {activeTab === "books" && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <SearchBar value={search.books} onChange={v => setTabSearch("books", v)} placeholder="Search title, author, genre…" />
            </div>
            <button
              onClick={() => bookModal.openAdd()}
              className="flex-shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              + Add Book
            </button>
          </div>

          {search.books && (
            <p className="text-slate-500 text-xs mb-3">{filteredBooks.length} of {books.length} entries</p>
          )}

          {booksSorted.length === 0 ? (
            <p className="text-slate-500 text-sm">{search.books ? "No matches." : "No books logged yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                    <SortableHeader col="Name"     label="Title"     sortKey={bookSort.sortKey} sortDir={bookSort.sortDir} onSort={bookSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Author"   label="Author"    sortKey={bookSort.sortKey} sortDir={bookSort.sortDir} onSort={bookSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Genre"    label="Genre"     sortKey={bookSort.sortKey} sortDir={bookSort.sortDir} onSort={bookSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Format"   label="Format"    sortKey={bookSort.sortKey} sortDir={bookSort.sortDir} onSort={bookSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="ReadDate" label="Date Read" sortKey={bookSort.sortKey} sortDir={bookSort.sortDir} onSort={bookSort.handleSort} align="right" className="pb-2 pr-4" />
                    <SortableHeader col="Rating"   label="Rating"    sortKey={bookSort.sortKey} sortDir={bookSort.sortDir} onSort={bookSort.handleSort} align="right" className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {booksSorted.map(b => (
                    <tr key={b.ID ?? b._rowIndex} className={rowHover} onClick={() => bookModal.openEdit(b)}>
                      <td className="py-2.5 pr-4 text-slate-200 font-medium">{b.Name}</td>
                      <td className="py-2.5 pr-4 text-slate-400">{b.Author || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-500 text-xs">{b.Genre || "—"}</td>
                      <td className="py-2.5 pr-4">
                        {b.Format ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${FORMAT_STYLE[b.Format] ?? "text-slate-400 bg-slate-700"}`}>{b.Format}</span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-400 text-right text-xs">{fmtDate(b.ReadDate)}</td>
                      <td className="py-2.5 text-right"><Stars rating={b.Rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Films */}
      {activeTab === "films" && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <SearchBar value={search.films} onChange={v => setTabSearch("films", v)} placeholder="Search title or year…" />
            </div>
            <button
              onClick={() => filmModal.openAdd()}
              className="flex-shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              + Add Film
            </button>
          </div>

          {search.films && (
            <p className="text-slate-500 text-xs mb-3">{filteredFilms.length} of {films.length} entries</p>
          )}

          {filmsSorted.length === 0 ? (
            <p className="text-slate-500 text-sm">{search.films ? "No matches." : "No films logged yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                    <SortableHeader col="Name"        label="Title"        sortKey={filmSort.sortKey} sortDir={filmSort.sortDir} onSort={filmSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="ReleaseYear"  label="Year"         sortKey={filmSort.sortKey} sortDir={filmSort.sortDir} onSort={filmSort.handleSort} align="right" className="pb-2 pr-4" />
                    <SortableHeader col="WatchDate"    label="Date Watched" sortKey={filmSort.sortKey} sortDir={filmSort.sortDir} onSort={filmSort.handleSort} align="right" className="pb-2 pr-4" />
                    <SortableHeader col="Rating"       label="Rating"       sortKey={filmSort.sortKey} sortDir={filmSort.sortDir} onSort={filmSort.handleSort} align="right" className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {filmsSorted.map(f => (
                    <tr key={f.ID ?? f._rowIndex} className={rowHover} onClick={() => filmModal.openEdit(f)}>
                      <td className="py-2.5 pr-4 text-slate-200 font-medium">{f.Name}</td>
                      <td className="py-2.5 pr-4 text-slate-500 text-right tabular-nums text-xs">{f.ReleaseYear || "—"}</td>
                      <td className="py-2.5 pr-4 text-slate-400 text-right text-xs">{fmtDate(f.WatchDate)}</td>
                      <td className="py-2.5 text-right"><Stars rating={f.Rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Games */}
      {activeTab === "games" && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <SearchBar value={search.games} onChange={v => setTabSearch("games", v)} placeholder="Search title, platform, genre…" />
            </div>
            <button
              onClick={() => gameModal.openAdd({ Status: "Completed" })}
              className="flex-shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              + Add Game
            </button>
          </div>

          {search.games && (
            <p className="text-slate-500 text-xs mb-3">{filteredGames.length} of {games.length} entries</p>
          )}

          {gamesSorted.length === 0 ? (
            <p className="text-slate-500 text-sm">{search.games ? "No matches." : "No games logged yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wide">
                    <SortableHeader col="Name"           label="Game"      sortKey={gameSort.sortKey} sortDir={gameSort.sortDir} onSort={gameSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Platform"        label="Platform"  sortKey={gameSort.sortKey} sortDir={gameSort.sortDir} onSort={gameSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Genre"           label="Genre"     sortKey={gameSort.sortKey} sortDir={gameSort.sortDir} onSort={gameSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="Status"          label="Status"    sortKey={gameSort.sortKey} sortDir={gameSort.sortDir} onSort={gameSort.handleSort} className="pb-2 pr-4" />
                    <SortableHeader col="CompletionDate"  label="Completed" sortKey={gameSort.sortKey} sortDir={gameSort.sortDir} onSort={gameSort.handleSort} align="right" className="pb-2 pr-4" />
                    <SortableHeader col="Rating"          label="Rating"    sortKey={gameSort.sortKey} sortDir={gameSort.sortDir} onSort={gameSort.handleSort} align="right" className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {gamesSorted.map(g => (
                    <tr key={g.ID ?? g._rowIndex} className={rowHover} onClick={() => gameModal.openEdit(g)}>
                      <td className="py-2.5 pr-4 text-slate-200 font-medium">{g.Name}</td>
                      <td className="py-2.5 pr-4 text-slate-400 text-xs">{g.Platform}</td>
                      <td className="py-2.5 pr-4 text-slate-500 text-xs">{g.Genre || "—"}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[g.Status] ?? "text-slate-400 bg-slate-700"}`}>
                          {g.Status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-400 text-right text-xs">{fmtDate(g.CompletionDate)}</td>
                      <td className="py-2.5 text-right"><Stars rating={g.Rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal open={bookModal.open} onClose={bookModal.close} title={bookModal.isEditing ? "Edit Book" : "Add Book"}>
        <EntityForm
          schema={SCHEMAS.ReadingLog}
          initialValues={bookModal.editRow}
          data={data}
          isEditing={bookModal.isEditing}
          onSubmit={handleBookSubmit}
          onCancel={bookModal.close}
          onDelete={bookModal.isEditing ? () => handleBookDelete(bookModal.editRow) : undefined}
        />
      </Modal>

      <Modal open={filmModal.open} onClose={filmModal.close} title={filmModal.isEditing ? "Edit Film" : "Add Film"}>
        <EntityForm
          schema={SCHEMAS.FilmLog}
          initialValues={filmModal.editRow}
          data={data}
          isEditing={filmModal.isEditing}
          onSubmit={handleFilmSubmit}
          onCancel={filmModal.close}
          onDelete={filmModal.isEditing ? () => handleFilmDelete(filmModal.editRow) : undefined}
        />
      </Modal>

      <Modal open={gameModal.open} onClose={gameModal.close} title={gameModal.isEditing ? "Edit Game" : "Add Game"}>
        <EntityForm
          schema={SCHEMAS.GamingLog}
          initialValues={gameModal.editRow}
          data={data}
          isEditing={gameModal.isEditing}
          onSubmit={handleGameSubmit}
          onCancel={gameModal.close}
          onDelete={gameModal.isEditing ? () => handleGameDelete(gameModal.editRow) : undefined}
        />
      </Modal>
    </div>
  );
}
