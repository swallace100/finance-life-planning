import { useState, useEffect } from 'react'

export function usePagination(items, pageSize = 100) {
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever the filtered list changes size (search/filter)
  useEffect(() => { setPage(1) }, [items.length])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const clamped    = Math.min(page, totalPages)
  const start      = (clamped - 1) * pageSize
  const pageItems  = items.slice(start, start + pageSize)

  return {
    page: clamped,
    pageItems,
    totalPages,
    totalItems: items.length,
    pageSize,
    setPage,
    hasPrev: clamped > 1,
    hasNext: clamped < totalPages,
    prev:  () => setPage(p => Math.max(1, p - 1)),
    next:  () => setPage(p => Math.min(totalPages, p + 1)),
    reset: () => setPage(1),
  }
}
