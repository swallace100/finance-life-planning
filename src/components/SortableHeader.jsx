export function SortableHeader({ col, label, align = 'left', sortKey, sortDir, onSort, className = '' }) {
  const active = sortKey === col
  return (
    <th
      onClick={() => onSort(col)}
      className={`cursor-pointer select-none ${align === 'right' ? 'text-right' : 'text-left'} text-slate-400 hover:text-slate-200 transition-colors ${className}`}
    >
      {label}
      <span className={`ml-1 text-xs ${active ? 'text-blue-400' : 'text-slate-600'}`}>
        {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  )
}
