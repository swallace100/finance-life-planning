export default function Pagination({ page, totalPages, totalItems, pageSize, hasPrev, hasNext, prev, next }) {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalItems)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700/50">
      <p className="text-slate-500 text-xs tabular-nums">
        {start}–{end} of {totalItems.toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <span className="text-slate-500 text-xs tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={next}
          disabled={!hasNext}
          className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
