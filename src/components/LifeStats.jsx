function parseProgress(str) {
  if (!str) return null
  const m = String(str).match(/^(\d+)\s*\/\s*(\d+)$/)
  if (!m) return null
  return { current: parseInt(m[1]), total: parseInt(m[2]) }
}

function StatTile({ label, value, sub, color = 'text-slate-100' }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  )
}

function GoalBar({ goal, parsed }) {
  const pct = Math.min((parsed.current / parsed.total) * 100, 100)
  const done = pct >= 100
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-slate-300 text-sm">{goal.Goal}</span>
        <span className="text-slate-400 text-xs tabular-nums ml-3 flex-shrink-0">
          {parsed.current.toLocaleString()} / {parsed.total.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-400' : 'bg-blue-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-slate-600 text-xs mt-1">{pct.toFixed(1)}%</p>
    </div>
  )
}

function QuickCount({ label, value, color = 'text-slate-300' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}

export default function LifeStats({ data }) {
  const books      = data?.ReadingLog    || []
  const films      = data?.FilmLog       || []
  const games      = data?.GamingLog     || []
  const lifetime   = data?.LifetimeGoals || []
  const education  = data?.EducationGoals || []
  const tasks      = data?.Tasks         || []
  const contacts   = data?.Contacts      || []
  const awards     = data?.Awards        || []
  const milestones = data?.Milestones    || []

  const gamesCompleted = games.filter(g => g.Status === 'Completed').length
  const gamesPlaying   = games.filter(g => g.Status === 'Playing')

  // Games by platform — sorted by count desc
  const byPlatform = {}
  games.forEach(g => { if (g.Platform) byPlatform[g.Platform] = (byPlatform[g.Platform] || 0) + 1 })
  const platforms = Object.entries(byPlatform).sort(([, a], [, b]) => b - a)
  const maxPlatformCount = platforms[0]?.[1] ?? 1

  // Lifetime goals that have a parseable "X/Y" progress value
  const goalsWithProgress = lifetime
    .filter(g => parseProgress(g.Progress))
    .map(g => ({ ...g, parsed: parseProgress(g.Progress) }))
    .sort((a, b) => {
      const pa = a.parsed.current / a.parsed.total
      const pb = b.parsed.current / b.parsed.total
      return pb - pa
    })

  const eduDone  = education.filter(e => e.Done).length
  const tasksDue = tasks.filter(t => t.DueDate && new Date(t.DueDate) >= new Date()).length
  const lifetimeDone = lifetime.filter(g => g.Status === 'Done').length

  if (!books.length && !films.length && !games.length && !lifetime.length) return null

  return (
    <div className="space-y-6">

      {/* ── Media + Games by Platform ── */}
      {(books.length > 0 || films.length > 0 || games.length > 0) && (
        <div className="card p-6">
          <h2 className="text-slate-300 font-medium mb-5">Media Library</h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <StatTile label="Books Read"    value={books.length}  color="text-amber-400" />
            <StatTile label="Films Watched" value={films.length}  color="text-sky-400" />
            <StatTile
              label="Games"
              value={gamesCompleted}
              sub={gamesPlaying.length > 0 ? `+${gamesPlaying.length} playing` : 'completed'}
              color="text-emerald-400"
            />
          </div>

          {gamesPlaying.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Currently Playing</p>
              <div className="flex flex-wrap gap-2">
                {gamesPlaying.map(g => (
                  <span key={g.ID ?? g._rowIndex} className="text-xs bg-emerald-400/10 text-emerald-400 px-2.5 py-1 rounded-full">
                    {g.Name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {platforms.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Games by Platform</p>
              <div className="space-y-2">
                {platforms.map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-20 flex-shrink-0">{platform}</span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(count / maxPlatformCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs tabular-nums w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lifetime Goal Progress ── */}
      {goalsWithProgress.length > 0 && (
        <div className="card p-6">
          <h2 className="text-slate-300 font-medium mb-5">Life Goals Progress</h2>
          <div className="space-y-4">
            {goalsWithProgress.map(g => (
              <GoalBar key={g.ID ?? g.Goal} goal={g} parsed={g.parsed} />
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Counts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lifetime.length > 0 && (
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Lifetime Goals</p>
            <div>
              <QuickCount label="Done"        value={lifetimeDone}                    color="text-emerald-400" />
              <QuickCount label="In Progress" value={lifetime.filter(g => g.Status === 'In Progress').length} color="text-amber-400" />
              <QuickCount label="Planned"     value={lifetime.filter(g => g.Status === 'Planned').length} />
              <QuickCount label="Total"       value={lifetime.length} />
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Education &amp; Certs</p>
            <div>
              <QuickCount label="Completed" value={eduDone}                          color="text-emerald-400" />
              <QuickCount label="Remaining" value={education.length - eduDone}       color="text-blue-400" />
              <QuickCount label="Total"     value={education.length} />
            </div>
          </div>
        )}

        {(tasks.length > 0 || contacts.length > 0) && (
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">People &amp; Tasks</p>
            <div>
              {tasks.length > 0    && <QuickCount label="Tasks"         value={tasks.length} />}
              {tasksDue > 0        && <QuickCount label="Due (upcoming)" value={tasksDue}   color="text-amber-400" />}
              {contacts.length > 0 && <QuickCount label="Contacts"      value={contacts.length} />}
              {contacts.filter(c => c.Favorite).length > 0 && (
                <QuickCount label="Favorites" value={contacts.filter(c => c.Favorite).length} color="text-amber-400" />
              )}
            </div>
          </div>
        )}

        {(awards.length > 0 || milestones.length > 0) && (
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Achievements</p>
            <div>
              {awards.length     > 0 && <QuickCount label="Awards"     value={awards.length} />}
              {milestones.length > 0 && <QuickCount label="Milestones" value={milestones.length} />}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
