import StatCard from '../components/StatCard'
import LifeStats from '../components/LifeStats'

export default function PlanningOverview({ data }) {
  if (!data) return null

  const tasks    = data.Tasks         || []
  const lifetime = data.LifetimeGoals || []
  const hasLifeStats =
    (data.ReadingLog?.length || data.FilmLog?.length || data.GamingLog?.length || lifetime.length) > 0

  const tasksDue     = tasks.filter(t => t.DueDate && new Date(t.DueDate) >= new Date()).length
  const lifetimeDone = lifetime.filter(g => g.Status === 'Done').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Open Tasks"
          value={tasks.length}
          sub={tasksDue > 0 ? `${tasksDue} with upcoming due dates` : undefined}
          valueClass="text-emerald-400"
        />
        <StatCard label="Lifetime Goals" value={lifetime.length} sub={`${lifetimeDone} done`} />
        <StatCard label="Milestones" value={(data.Milestones || []).length} sub={`${(data.Awards || []).length} awards`} />
      </div>

      {hasLifeStats ? (
        <LifeStats data={data} />
      ) : (
        <p className="text-slate-500 text-sm">
          Life stats will appear here once you add goals, tasks, or media logs.
        </p>
      )}
    </div>
  )
}
