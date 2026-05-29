import { useState, useCallback } from 'react'

function coerce(val) {
  if (val == null) return null
  if (typeof val === 'number' || typeof val === 'boolean') return val
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d
  }
  return val
}

function compare(a, b, dir) {
  const va = coerce(a)
  const vb = coerce(b)
  if (va == null && vb == null) return 0
  if (va == null) return 1
  if (vb == null) return -1
  let result
  if (va instanceof Date && vb instanceof Date) {
    result = va - vb
  } else if (typeof va === 'number' && typeof vb === 'number') {
    result = va - vb
  } else if (typeof va === 'boolean' && typeof vb === 'boolean') {
    result = Number(va) - Number(vb)
  } else {
    result = String(va).toLowerCase().localeCompare(String(vb).toLowerCase())
  }
  return dir === 'asc' ? result : -result
}

export function useSortableTable(initialKey = null, initialDir = 'asc') {
  const [sort, setSort] = useState({ key: initialKey, dir: initialDir })

  const handleSort = useCallback((key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  function applySort(rows, getVal) {
    if (!sort.key) return rows
    return [...rows].sort((a, b) => {
      const va = getVal ? getVal(a, sort.key) : a[sort.key]
      const vb = getVal ? getVal(b, sort.key) : b[sort.key]
      return compare(va, vb, sort.dir)
    })
  }

  return { sortKey: sort.key, sortDir: sort.dir, handleSort, applySort }
}
