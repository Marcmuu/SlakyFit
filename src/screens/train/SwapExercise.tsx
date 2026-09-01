import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { exercises, getExercise } from '../../data/exercises'
import { equipmentLabels } from '../../lib/equipmentLabels'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

export default function SwapExercise() {
  const { index } = useParams()
  const idx = Number(index)
  const { activeWorkout, setActiveWorkout } = useAppStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)

  const sessionEx = activeWorkout?.exercises[idx]
  const current = sessionEx ? getExercise(sessionEx.exerciseId) : undefined

  const alternatives = useMemo(() => (current ? current.alternativeIds.map((id) => getExercise(id)!).filter(Boolean) : []), [current])

  const libraryResults = useMemo(() => {
    if (!showLibrary) return []
    const q = query.trim().toLowerCase()
    return exercises.filter((e) => e.section === 'main' && (!q || e.name.toLowerCase().includes(q)) && e.id !== current?.id).slice(0, 30)
  }, [query, showLibrary, current])

  if (!activeWorkout || !sessionEx || !current) {
    return (
      <div>
        <PageHeader title="Cambiar ejercicio" onBack />
      </div>
    )
  }

  function pick(newExerciseId: string) {
    const exercises2 = [...activeWorkout!.exercises]
    exercises2[idx] = {
      ...exercises2[idx],
      originalExerciseId: exercises2[idx].originalExerciseId ?? exercises2[idx].exerciseId,
      exerciseId: newExerciseId,
      sets: [],
    }
    setActiveWorkout({ ...activeWorkout!, exercises: exercises2 })
    navigate('/train/session')
  }

  return (
    <div>
      <PageHeader title="Cambiar ejercicio" subtitle={`En lugar de ${current.name}`} onBack />
      <div className="px-4 flex flex-col gap-4">
        {!showLibrary && (
          <>
            <div>
              <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Alternativas sugeridas</p>
              <div className="flex flex-col gap-2">
                {alternatives.map((alt) => (
                  <button key={alt.id} onClick={() => pick(alt.id)} className="text-left">
                    <Card className="active:bg-base-800">
                      <p className="font-semibold text-base-100">{alt.name}</p>
                      <p className="text-xs text-base-500">{alt.mainMuscles.join(', ')} · {equipmentLabels[alt.equipment]}</p>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowLibrary(true)} className="text-sm text-brand font-semibold underline underline-offset-2 text-center">
              Ver toda la biblioteca de ejercicios
            </button>
          </>
        )}

        {showLibrary && (
          <>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
            />
            <div className="flex flex-col gap-2">
              {libraryResults.map((ex) => (
                <button key={ex.id} onClick={() => pick(ex.id)} className="text-left">
                  <Card className="active:bg-base-800 p-3">
                    <p className="font-semibold text-base-100">{ex.name}</p>
                    <p className="text-xs text-base-500">{ex.mainMuscles.join(', ')} · {equipmentLabels[ex.equipment]}</p>
                  </Card>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
