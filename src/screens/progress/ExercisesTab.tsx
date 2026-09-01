import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { exercises } from '../../data/exercises'
import { getExerciseHistory, prForExercise, bestE1RMForExercise } from '../../data/progression'
import { formatWeight } from '../../lib/format'
import Card from '../../components/Card'

export default function ExercisesTab() {
  const { sessions } = useAppStore()
  const navigate = useNavigate()

  const tracked = useMemo(() => {
    return exercises
      .filter((e) => e.section === 'main')
      .map((e) => ({ exercise: e, history: getExerciseHistory(e.id, sessions) }))
      .filter((t) => t.history.length > 0)
      .sort((a, b) => b.history.length - a.history.length)
  }, [sessions])

  if (tracked.length === 0) {
    return <p className="text-center text-base-500 py-8 text-sm">Todavía no hay ejercicios registrados.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {tracked.map(({ exercise, history }) => {
        const pr = prForExercise(exercise.id, sessions)
        const e1rm = bestE1RMForExercise(exercise.id, sessions)
        const current = history[0]?.sets[0]
        return (
          <button key={exercise.id} onClick={() => navigate(`/library/${exercise.id}`)} className="text-left">
            <Card className="active:bg-base-800 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-base-100">{exercise.name}</p>
                <span className="text-base-600">›</span>
              </div>
              <div className="flex gap-4 text-xs text-base-400 tabular">
                <span>Actual: {current ? `${formatWeight(current.weight)} kg` : '—'}</span>
                <span>PR: {pr ? `${formatWeight(pr.weight)}×${pr.reps}` : '—'}</span>
                <span>e1RM: {e1rm ? `${formatWeight(e1rm)} kg` : '—'}</span>
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
