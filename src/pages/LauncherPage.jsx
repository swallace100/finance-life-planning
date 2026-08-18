import { FileControls } from '../components/Sidebar'
import { WORKSPACES } from '../config/workspaces'
import { computeNetWorthParts, stillOwned } from '../utils/netWorth'

const fmt = (n) => '$' + Math.round(n).toLocaleString()

function headlineStat(workspaceId, data) {
  if (!data) return { value: '—', sub: '' }

  if (workspaceId === 'finance') {
    return { value: fmt(computeNetWorthParts(data).netWorth), sub: 'net worth' }
  }
  if (workspaceId === 'collections') {
    const tangible = (data.TangibleAssets || []).filter(stillOwned)
    const digital  = (data.DigitalAssets  || []).filter(stillOwned)
    const value = tangible.reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
                + digital.reduce((s, t) => s + (Number(t.CurrentValue) || 0), 0)
    return { value: fmt(value), sub: `${tangible.length + digital.length} items` }
  }
  // planning
  const tasks = data.Tasks || []
  const lifetime = data.LifetimeGoals || []
  return { value: tasks.length, sub: `open tasks · ${lifetime.length} goals` }
}

export default function LauncherPage({
  data,
  loading,
  onOpenWorkspace,
  usingMock,
  excelPath,
  error,
  onPickFile,
  onNewFile,
  hasElectron,
  onDownload,
  onUpload,
  demoMode,
  onToggleDemoMode,
}) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-widest">Finance · Life · Planning</h1>
          <p className="text-slate-500 text-sm mt-2">Choose a workspace</p>
          {usingMock && !demoMode && (
            <p className="text-amber-400 text-xs mt-3">
              No workbook connected — showing sample data
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {WORKSPACES.map((w) => {
            const stat = loading ? { value: '…', sub: 'loading' } : headlineStat(w.id, data)
            return (
              <button
                key={w.id}
                onClick={() => onOpenWorkspace(w.id)}
                className={`card p-6 text-left transition-colors border ${w.accent.tileBorder} group`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${w.accent.tileGlow}`}>
                  {w.tileIcon}
                </div>
                <h2 className="text-slate-100 font-semibold text-lg">{w.label}</h2>
                <p className="text-slate-500 text-xs mt-1 mb-5">{w.tagline}</p>
                <p className={`text-2xl font-bold tabular-nums ${w.accent.text}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.sub}</p>
              </button>
            )
          })}
        </div>

        <div className="max-w-sm mx-auto card">
          <FileControls
            usingMock={usingMock}
            excelPath={excelPath}
            error={error}
            onPickFile={onPickFile}
            onNewFile={onNewFile}
            hasElectron={hasElectron}
            onDownload={onDownload}
            onUpload={onUpload}
            demoMode={demoMode}
            onToggleDemoMode={onToggleDemoMode}
          />
        </div>
      </div>
    </div>
  )
}
