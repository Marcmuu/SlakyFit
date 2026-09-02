import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { exercises } from '../../data/exercises'
import { getExerciseHistory, prForExercise, bestE1RMForExercise } from '../../data/progression'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import { formatWeight } from '../../lib/format'
import { describeSet } from '../../lib/setFormat'
import Card from '../../components/Card'

export default function ExercisesTab() {
  const { sessions } = useAppStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const tracked = useMemo(() => {
    return exercises
      .filter((e) => e.section === 'main')
      .map((e) => ({ exercise: e, history: getExerciseHistory(e.id, sessions) }))
      .filter((t) => t.history.length > 0)
      .sort((a, b) => b.history.length - a.history.length)
  }, [sessions])

  const filtered = useMemo(() => tracked.filter((t) => matchesExerciseQuery(t.exercise, query)), [tracked, query])

  if (tracked.length === 0) {
    return <p className="text-center text-base-500 py-8 text-sm">Todavía no hay ejercicios registrados.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o músculo..."
        className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
      />
      <div className="flex flex-col gap-2">
        {filtered.map(({ exercise, history }) => {
          const isTime = exercise.logType === 'time'
          const pr = isTime ? undefined : prForExercise(exercise.id, sessions)
          const e1rm = isTime ? 0 : bestE1RMForExercise(exercise.id, sessions)
          const current = history[0]?.sets[0]
          const bestDurationSec = isTime ? Math.max(0, ...history.flatMap((h) => h.sets.map((s) => s.durationSec ?? 0))) : 0
          return (
            <button key={exercise.id} onClick={() => navigate(`/library/${exercise.id}`)} className="text-left">
              <Card className="active:bg-base-800 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-base-100 flex-1 min-w-0 truncate pr-2">{exercise.name}</p>
                  <span className="text-base-600 shrink-0">›</span>
                </div>
                <div className="flex gap-4 text-xs text-base-400 tabular">
                  {isTime ? (
                    <>
                      <span>Actual: {current?.durationSec ? `${current.durationSec}s` : '—'}</span>
                      <span>Mejor: {bestDurationSec ? `${bestDurationSec}s` : '—'}</span>
                    </>
                  ) : (
                    <>
                      <span>Actual: {current ? describeSet(exercise, current) : '—'}</span>
                      <span>PR: {pr ? describeSet(exercise, pr) : '—'}</span>
                      <span>e1RM: {e1rm ? `${formatWeight(e1rm)} kg` : '—'}</span>
                    </>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-base-500 py-6 text-sm">Ningún ejercicio registrado coincide con "{query}".</p>}
      </div>
    </div>
  )
}
