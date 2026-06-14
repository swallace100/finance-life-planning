export default function Chevron({ open, className = '' }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
