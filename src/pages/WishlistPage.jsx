import { useState } from 'react'
import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'
import { useSortableTable } from '../hooks/useSortableTable'
import { SortableHeader } from '../components/SortableHeader'
import Chevron from '../components/Chevron'

const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const PRIORITY_COLORS = {
  High:   'text-red-400 bg-red-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  Low:    'text-slate-400 bg-slate-700',
}

const STATUS_COLORS = {
  Wanted:    'text-blue-400 bg-blue-400/10',
  Found:     'text-emerald-400 bg-emerald-400/10',
  Purchased: 'text-slate-500 bg-slate-800',
}

// When an item is marked Purchased, auto-create an entry in the matching collection sheet.
const CATEGORY_MAP = {
  Books:  { sheet: 'ReadingLog',     map: w => ({ Name: w.Name, Author: w.Creator, Notes: w.Notes }) },
  Films:  { sheet: 'FilmLog',        map: w => ({ Name: w.Name, Notes: w.Notes }) },
  Games:  { sheet: 'GamingLog',      map: w => ({ Name: w.Name, Status: 'Backlog', Notes: w.Notes }) },
  Vinyl:  { sheet: 'TangibleAssets', map: w => ({ Name: w.Name, Category: 'Vinyl',  Cost: w.TargetPrice, Notes: w.Notes, StillHave: true }) },
  Comics: { sheet: 'TangibleAssets', map: w => ({ Name: w.Name, Category: 'Comics', Cost: w.TargetPrice, Notes: w.Notes, StillHave: true }) },
  Art:    { sheet: 'TangibleAssets', map: w => ({ Name: w.Name, Category: 'Art',    Cost: w.TargetPrice, Notes: w.Notes, StillHave: true }) },
}

function WishlistRow({ item, dimmed, onEdit }) {
  return (
    <tr
      className={`table-row ${dimmed ? 'opacity-40' : ''}`}
      onClick={() => onEdit(item)}
    >
      <td className="py-3 pr-4 text-slate-200 font-medium">{item.Name}</td>
      <td className="py-3 pr-4 text-slate-400 text-xs">{item.Category || '—'}</td>
      <td className="py-3 pr-4 text-slate-400">{item.Creator || '—'}</td>
      <td className="py-3 pr-4">
        {item.Priority ? (
          <span className={`badge ${PRIORITY_COLORS[item.Priority] ?? PRIORITY_COLORS.Low}`}>
            {item.Priority}
          </span>
        ) : '—'}
      </td>
      <td className="py-3 pr-4 text-right text-slate-400 tabular-nums">
        {item.TargetPrice ? fmtCurrency.format(item.TargetPrice) : '—'}
      </td>
      <td className="py-3 text-right">
        <span className={`badge ${STATUS_COLORS[item.Status] ?? STATUS_COLORS.Wanted}`}>
          {item.Status || 'Wanted'}
        </span>
      </td>
    </tr>
  )
}

export default function WishlistPage({ data, onSave, onDelete }) {
  const modal = useEntityModal()
  const { sortKey, sortDir, handleSort, applySort } = useSortableTable('Name', 'asc')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showPurchased, setShowPurchased] = useState(false)

  const allItems = data?.Wishlist || []

  const existingCategories = Array.from(new Set(allItems.map(i => i.Category).filter(Boolean))).sort()
  const categories = ['All', ...existingCategories]

  const q = s => (s == null ? '' : String(s)).toLowerCase()

  const filtered = allItems.filter(item => {
    if (categoryFilter !== 'All' && item.Category !== categoryFilter) return false
    if (search) {
      const sq = q(search)
      return q(item.Name).includes(sq) || q(item.Creator).includes(sq) || q(item.Notes).includes(sq)
    }
    return true
  })

  const active    = applySort(filtered.filter(i => i.Status !== 'Purchased'))
  const purchased = applySort(filtered.filter(i => i.Status === 'Purchased'))

  const totalWanted    = allItems.filter(i => i.Status === 'Wanted').length
  const totalFound     = allItems.filter(i => i.Status === 'Found').length
  const totalPurchased = allItems.filter(i => i.Status === 'Purchased').length

  async function handleSubmit(row) {
    const wasAlreadyPurchased = modal.isEditing && modal.editRow?.Status === 'Purchased'
    const nowPurchased = row.Status === 'Purchased'

    await onSave('Wishlist', row, !modal.isEditing)

    // First time marked Purchased → auto-create in the matching collection
    if (nowPurchased && !wasAlreadyPurchased) {
      const mapping = CATEGORY_MAP[row.Category]
      if (mapping) {
        await onSave(mapping.sheet, mapping.map(row), true)
      }
    }

    modal.close()
  }

  async function handleDelete(row) {
    await onDelete('Wishlist', row._rowIndex)
    modal.close()
  }

  const tableHead = (
    <tr className="th-row">
      <SortableHeader col="Name"        label="Name"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="Category"    label="Category"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="Creator"     label="Author / Director / Dev" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="Priority"    label="Priority"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pb-2 pr-4" />
      <SortableHeader col="TargetPrice" label="Target Price"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2 pr-4" />
      <SortableHeader col="Status"      label="Status"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" className="pb-2" />
    </tr>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Wishlist</h2>
        <button
          onClick={() => modal.openAdd({ Status: 'Wanted', Priority: 'Medium' })}
          className="btn-primary"
        >
          + Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="card px-4 py-3 flex items-center gap-2">
          <span className="text-blue-400 font-bold text-lg tabular-nums">{totalWanted}</span>
          <span className="text-slate-500 text-sm">wanted</span>
        </div>
        <div className="card px-4 py-3 flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-lg tabular-nums">{totalFound}</span>
          <span className="text-slate-500 text-sm">found</span>
        </div>
        <div className="card px-4 py-3 flex items-center gap-2">
          <span className="text-slate-400 font-bold text-lg tabular-nums">{totalPurchased}</span>
          <span className="text-slate-500 text-sm">purchased</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active items (Wanted + Found) */}
      <div className="card overflow-hidden">
        {active.length === 0 ? (
          <p className="text-slate-500 text-sm p-6">
            {allItems.length === 0
              ? 'Nothing on the wishlist yet. Add an item to start tracking what you\'re hunting for.'
              : 'No active items match your filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto px-6 pt-2 pb-5">
            <table className="w-full text-sm">
              <thead>{tableHead}</thead>
              <tbody>
                {active.map(item => (
                  <WishlistRow key={item.ID ?? item._rowIndex} item={item} onEdit={modal.openEdit} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Purchased archive — collapsed by default */}
      {(purchased.length > 0 || totalPurchased > 0) && (
        <div className="card overflow-hidden">
          <button
            className="collapsible-btn"
            onClick={() => setShowPurchased(v => !v)}
          >
            <span className="text-slate-500 text-sm font-medium">
              Purchased ({totalPurchased})
              {totalPurchased > 0 && <span className="ml-2 text-slate-600 text-xs">· added to collection automatically</span>}
            </span>
            <Chevron open={showPurchased} />
          </button>
          {showPurchased && purchased.length > 0 && (
            <div className="section-body">
              <table className="w-full text-sm">
                <thead>{tableHead}</thead>
                <tbody>
                  {purchased.map(item => (
                    <WishlistRow key={item.ID ?? item._rowIndex} item={item} dimmed onEdit={modal.openEdit} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showPurchased && purchased.length === 0 && (
            <p className="text-slate-600 text-xs px-6 pb-4">No purchased items match your current filters.</p>
          )}
        </div>
      )}

      <Modal open={modal.open} onClose={modal.close} title={modal.isEditing ? 'Edit Wishlist Item' : 'Add to Wishlist'}>
        <EntityForm
          schema={SCHEMAS.Wishlist}
          initialValues={modal.editRow}
          data={data}
          isEditing={modal.isEditing}
          onSubmit={handleSubmit}
          onCancel={modal.close}
          onDelete={modal.isEditing ? () => handleDelete(modal.editRow) : undefined}
        />
      </Modal>
    </div>
  )
}
