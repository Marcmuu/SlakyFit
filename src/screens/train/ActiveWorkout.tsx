import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { routineLists } from '../../data/routineLists'
import { templateLabel } from '../../lib/categoryMeta'
import { newId } from '../../lib/id'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import Card from '../../components/Card'
import Button from '../../components/Button'
import type { SessionExercise, WorkoutSession } from '../../types'

export default function ActiveWorkout() {
  const { activeWorkout, setActiveWorkout, addSession } = useAppStore()
  const navigate = useNavigate()
  const [showFinish, setShowFinish] = useState(false)
  const [notes, setNotes] = useState('')
  useBodyScrollLock(showFinish)

  useEffect(() => {
    if (!activeWorkout) navigate('/train', { replace: true })
  }, [activeWorkout, navigate])

  if (!activeWorkout) return null

  function move(index: number, dir: -1 | 1) {
    const list = [...activeWorkout!.exercises]
    const target = index + dir
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setActiveWorkout({ ...activeWorkout!, exercises: list.map((e, i) => ({ ...e, order: i + 1 })) })
  }

  function removeExercise(index: number) {
    const list = activeWorkout!.exercises.filter((_, i) => i !== index).map((e, i) => ({ ...e, order: i + 1 }))
    setActiveWorkout({ ...activeWorkout!, exercises: list })
  }

  function addAbs() {
    const absRoutine = routineLists.find((r) => r.id === 'abs-rapido')!
    const extras = absRoutine.exerciseIds.map((id, i) => ({
      exerciseId: id,
      order: activeWorkout!.exercises.length + i + 1,
      isExtra: true,
      targetSets: 2,
      repMin: 12,
      repMax: 20,
      sets: [],
    }))
    setActiveWorkout({ ...activeWorkout!, exercises: [...activeWorkout!.exercises, ...extras] })
    setShowFinish(false)
  }

  function finish() {
    const exercises: SessionExercise[] = activeWorkout!.exercises
      .filter((e) => e.sets.length > 0)
      .map((e) => ({
        exerciseId: e.exerciseId,
        originalExerciseId: e.originalExerciseId,
        order: e.order,
        isExtra: e.isExtra,
        sets: e.sets,
      }))

    const session: WorkoutSession = {
      id: newId('session'),
      date: new Date().toISOString().slice(0, 10),
      recommendedTemplateId: activeWorkout!.recommendedTemplateId,
      actualCategory: activeWorkout!.category,
      actualVariant: activeWorkout!.variant,
      durationMin: Math.max(1, Math.round((Date.now() - new Date(activeWorkout!.startedAt).getTime()) / 60000)),
      exercises,
      notes: notes.trim() || undefined,
    }
    addSession(session)
    setActiveWorkout(null)
    navigate(`/calendar/${session.date}`, { replace: true })
  }

  const totalSets = activeWorkout.exercises.reduce((sum, e) => sum + e.sets.length, 0)

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
        <div>
          <p className="text-sm text-base-400">Entrenando</p>
          <h1 className="text-2xl font-extrabold">{templateLabel(activeWorkout.category, activeWorkout.variant)}</h1>
        </div>
        <button
          onClick={() => {
            setActiveWorkout(null)
            navigate('/')
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-base-800 text-base-300"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="px-4 mb-3 text-sm text-base-400">{totalSets} series registradas</div>

      <div className="px-4 flex flex-col gap-2.5">
        {activeWorkout.exercises.map((sessionEx, index) => {
          const exercise = getExercise(sessionEx.exerciseId)!
          const done = sessionEx.sets.length
          const started = done > 0
          const completed = done >= sessionEx.targetSets
          return (
            <Card
              key={`${sessionEx.exerciseId}-${index}`}
              className={`p-3 transition-colors ${started ? 'border-brand/50 bg-brand/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="w-6 h-6 flex items-center justify-center text-base-500 disabled:opacity-20"
                  >
                    ▲
                  </button>
                  <button
                    disabled={index === activeWorkout.exercises.length - 1}
                    onClick={() => move(index, 1)}
                    className="w-6 h-6 flex items-center justify-center text-base-500 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </div>
                {started && (
                  <span className="w-5 h-5 rounded-full bg-brand text-base-950 flex items-center justify-center shrink-0" aria-hidden>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/train/session/exercise/${index}`)}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base-100 truncate">{exercise.name}</span>
                    {sessionEx.isExtra && <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full shrink-0">EXTRA</span>}
                    {sessionEx.originalExerciseId && <span className="text-[10px] font-bold text-accent-pull bg-accent-pull/10 px-1.5 py-0.5 rounded-full shrink-0">SUSTITUIDO</span>}
                  </div>
                  <p className={`text-xs mt-0.5 tabular ${completed ? 'text-brand font-semibold' : started ? 'text-brand/80' : 'text-base-500'}`}>
                    {done}/{sessionEx.targetSets} series · {sessionEx.repMin}-{sessionEx.repMax} reps
                  </p>
                </button>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button onClick={() => navigate(`/train/session/swap/${index}`)} className="text-xs text-base-400 underline underline-offset-2">
                    Cambiar
                  </button>
                  <button onClick={() => removeExercise(index)} className="text-xs text-accent-push">
                    Quitar
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="px-4 mt-4">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/train/session/add')}>
          + Añadir ejercicio
        </Button>
      </div>

      <div className="px-4 mt-6">
        <Button size="lg" className="w-full" onClick={() => setShowFinish(true)}>
          Finalizar entrenamiento
        </Button>
      </div>

      {showFinish && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-md bg-base-900 rounded-t-3xl p-5 safe-bottom">
            <p className="text-lg font-bold mb-1">¿Terminar aquí?</p>
            <p className="text-sm text-base-400 mb-4">Puedes añadir un ABS rápido antes de guardar, o finalizar directamente.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas de la sesión (opcional)"
              className="w-full bg-base-800 border border-base-700 rounded-xl p-3 text-sm text-base-100 mb-4 resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-2.5">
              <Button variant="secondary" size="lg" onClick={addAbs}>
                Añadir ABS
              </Button>
              <Button size="lg" onClick={finish}>
                Finalizar y guardar
              </Button>
              <Button variant="ghost" onClick={() => setShowFinish(false)}>
                Seguir entrenando
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
