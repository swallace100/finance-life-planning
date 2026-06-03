import Modal from "../components/Modal";
import EntityForm from "../components/EntityForm";
import { SCHEMAS } from "../data/schemas";
import { useEntityModal } from "../hooks/useEntityModal";
import { isElectron, openPath, openExternal } from "../api";

function openLink(link) {
  if (!link) return;
  if (link.startsWith("http://") || link.startsWith("https://")) {
    openExternal(link);
  } else {
    openPath(link);
  }
}

function isURL(link) {
  return link?.startsWith("http://") || link?.startsWith("https://");
}

function FileIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

export default function ResearchPage({ data, onSave, onDelete }) {
  const modal = useEntityModal();
  const links = data?.ResearchLinks || [];

  const byCategory = links.reduce((acc, r) => {
    const c = r.Category || "Uncategorized";
    if (!acc[c]) acc[c] = [];
    acc[c].push(r);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort();

  async function handleSubmit(row) {
    await onSave("ResearchLinks", row, row._rowIndex == null);
    modal.close();
  }

  async function handleDelete(row) {
    await onDelete("ResearchLinks", row._rowIndex);
    modal.close();
  }

  const hasElectron = isElectron;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Research</h2>
        <button
          onClick={() => modal.openAdd()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          + Add Link
        </button>
      </div>

      {!hasElectron && (
        <p className="text-amber-400 text-xs bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2">
          Running in browser — file links can't be opened directly. They'll work in the desktop app.
        </p>
      )}

      {links.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-500 text-sm">No research links yet. Add a link to a Word doc, PDF, or URL.</p>
        </div>
      ) : categories.map(cat => (
        <div key={cat} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 font-medium">{cat}</h3>
            <span className="text-slate-500 text-sm">{byCategory[cat].length} item{byCategory[cat].length !== 1 ? "s" : ""}</span>
          </div>

          <div className="space-y-2">
            {byCategory[cat].map(r => (
              <div
                key={r.ID ?? r._rowIndex}
                className="flex items-start gap-3 px-4 py-3 rounded-lg bg-slate-700/30 border border-slate-700 hover:bg-slate-700/50 transition-colors group"
              >
                <div className="mt-0.5">
                  {isURL(r.Link) ? <LinkIcon /> : <FileIcon />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium">{r.Title}</p>
                  <p className="text-slate-500 text-xs truncate mt-0.5" title={r.Link}>{r.Link}</p>
                  {r.Notes && <p className="text-slate-400 text-xs mt-1">{r.Notes}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openLink(r.Link)}
                    disabled={!hasElectron}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => modal.openEdit(r)}
                    className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modal.open} onClose={modal.close} title={modal.isEditing ? "Edit Link" : "Add Link"}>
        <EntityForm
          schema={SCHEMAS.ResearchLinks}
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
