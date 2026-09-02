import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getExercise } from '../../data/exercises'
import { newId } from '../../lib/id'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ActionSheet from '../../components/ActionSheet'
import type { SessionExercise, WorkoutSession } from '../../types'

export default function ActiveWorkout() {
  const { activeWorkout, setActiveWorkout, addSession } = useAppStore()
  const navigate = useNavigate()
  const [showFinish, setShowFinish] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  useBodyScrollLock(showFinish || showDiscard)

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
      routineId: activeWorkout!.routineId,
      dayId: activeWorkout!.dayId,
      dayName: activeWorkout!.dayName,
      dayColor: activeWorkout!.dayColor,
      durationMin: Math.max(1, Math.round((Date.now() - new Date(activeWorkout!.startedAt).getTime()) / 60000)),
      exercises,
    }
    addSession(session)
    setActiveWorkout(null)
    navigate(`/calendar/${session.date}`, { replace: true })
  }

  function discard() {
    setActiveWorkout(null)
    navigate('/')
  }

  const totalSets = activeWorkout.exercises.reduce((sum, e) => sum + e.sets.length, 0)

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-sm text-base-400">Entrenando</p>
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: activeWorkout.dayColor }} />
            <h1 className="text-2xl font-extrabold truncate">{activeWorkout.dayName}</h1>
          </div>
        </div>
        <button
          onClick={() => setShowDiscard(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-base-800 text-base-300 shrink-0"
          aria-label="Cerrar entrenamiento sin guardar"
        >
          ✕
        </button>
      </div>
      <p className="px-4 mb-3 text-xs text-base-500">Desliza hacia abajo desde arriba para minimizar y seguir navegando sin perder el progreso.</p>

      <div className="px-4 mb-3 text-sm text-base-400">{totalSets} series registradas</div>

      <div className="px-4 flex flex-col gap-2.5">
        {activeWorkout.exercises.map((sessionEx, index) => {
          const exercise = getExercise(sessionEx.exerciseId)!
          const done = sessionEx.sets.length
          const partial = done > 0 && done < sessionEx.targetSets
          const completed = done >= sessionEx.targetSets

          if (completed) {
            return (
              <Card key={`${sessionEx.exerciseId}-${index}`} className="p-0 border-brand/50 bg-brand/5 overflow-hidden">
                <button className="w-full flex items-center gap-3 px-3 py-2.5" onClick={() => navigate(`/train/session/exercise/${index}`)}>
                  <span className="w-5 h-5 rounded-full bg-brand text-base-950 flex items-center justify-center shrink-0" aria-hidden>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium text-base-200">{exercise.name}</span>
                  <span className="text-xs text-brand font-semibold tabular shrink-0">
                    {done}/{sessionEx.targetSets}
                  </span>
                </button>
              </Card>
            )
          }

          return (
            <Card
              key={`${sessionEx.exerciseId}-${index}`}
              className={`p-3 transition-colors ${partial ? 'border-accent-warning/50 bg-accent-warning/5' : ''}`}
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
                {partial && (
                  <span className="w-5 h-5 rounded-full bg-accent-warning text-base-950 flex items-center justify-center shrink-0" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
                      <path d="M12 10v4" strokeLinecap="round" />
                      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                )}
                <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/train/session/exercise/${index}`)}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base-100 truncate">{exercise.name}</span>
                    {sessionEx.isExtra && <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full shrink-0">EXTRA</span>}
                    {sessionEx.originalExerciseId && <span className="text-[10px] font-bold text-accent-pull bg-accent-pull/10 px-1.5 py-0.5 rounded-full shrink-0">SUSTITUIDO</span>}
                  </div>
                  <p className={`text-xs mt-0.5 tabular ${partial ? 'text-accent-warning font-semibold' : 'text-base-500'}`}>
                    {done}/{sessionEx.targetSets} series · {sessionEx.repMin}-{sessionEx.repMax}
                    {exercise.logType === 'time' ? 's' : ' reps'}
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
        <ActionSheet onDismiss={() => setShowFinish(false)}>
          <p className="text-lg font-bold mb-1">¿Terminar aquí?</p>
          <p className="text-sm text-base-400 mb-5">
            Se guardará el entrenamiento con las series registradas. Si te falta algún ejercicio, usa "+ Añadir ejercicio" antes de finalizar.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button size="lg" onClick={finish}>
              Finalizar y guardar
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setShowFinish(false)}>
              Seguir entrenando
            </Button>
          </div>
        </ActionSheet>
      )}

      {showDiscard && (
        <ActionSheet onDismiss={() => setShowDiscard(false)}>
          <p className="text-lg font-bold mb-1">¿Cerrar sin guardar?</p>
          <p className="text-sm text-base-400 mb-5">
            Se perderán todas las series registradas en este entrenamiento. Si quieres seguir más tarde, usa el gesto de deslizar hacia abajo en vez de cerrar.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button variant="danger" size="lg" onClick={discard}>
              Cerrar sin guardar
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setShowDiscard(false)}>
              Volver al entrenamiento
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
