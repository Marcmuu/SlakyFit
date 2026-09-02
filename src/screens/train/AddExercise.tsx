import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { exercises } from '../../data/exercises'
import { equipmentLabels } from '../../lib/equipmentLabels'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

export default function AddExercise() {
  const { activeWorkout, setActiveWorkout } = useAppStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    return exercises
      .filter((e) => (e.section === 'main' || e.section === 'abs') && matchesExerciseQuery(e, query))
      .slice(0, 40)
  }, [query])

  if (!activeWorkout) return null

  function add(exerciseId: string) {
    const exercise = exercises.find((e) => e.id === exerciseId)
    const isAbs = exercise?.section === 'abs'
    const isTime = exercise?.logType === 'time'
    const next = {
      exerciseId,
      order: activeWorkout!.exercises.length + 1,
      isExtra: true,
      targetSets: 3,
      repMin: isTime ? 20 : isAbs ? 12 : 8,
      repMax: isTime ? 40 : isAbs ? 20 : 12,
      sets: [],
    }
    setActiveWorkout({ ...activeWorkout!, exercises: [...activeWorkout!.exercises, next] })
    navigate('/train/session', { replace: true })
  }

  return (
    <div>
      <PageHeader title="Añadir ejercicio" onBack />
      <div className="px-4 flex flex-col gap-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o músculo (ej. abs, pierna)..."
          className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
        />
        <div className="flex flex-col gap-2">
          {results.map((ex) => (
            <button key={ex.id} onClick={() => add(ex.id)} className="text-left">
              <Card className="active:bg-base-800 p-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-base-100">{ex.name}</p>
                  {ex.section === 'abs' && (
                    <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full shrink-0">ABS</span>
                  )}
                </div>
                <p className="text-xs text-base-500">{ex.mainMuscles.join(', ')} · {equipmentLabels[ex.equipment]}</p>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
