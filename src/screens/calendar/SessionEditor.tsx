import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { exercises, getExercise } from '../../data/exercises'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import { equipmentLabels } from '../../lib/equipmentLabels'
import { newId } from '../../lib/id'
import { colorForDayIndex, readableTextColor } from '../../lib/color'
import { todayIso } from '../../lib/format'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ActionSheet from '../../components/ActionSheet'
import Stepper from '../../components/Stepper'
import RIRSelector from '../../components/RIRSelector'
import { describeSet } from '../../lib/setFormat'
import type { Exercise, RoutineDay, SessionExercise, SetEntry, WorkoutSession } from '../../types'

function defaultSet(exercise: Exercise): SetEntry {
  if (exercise.logType === 'time') return { durationSec: exercise.defaultDurationSec ?? 30, rir: '2-3' }
  if (exercise.logType === 'bodyweight-reps') return { reps: 8, rir: '2-3' }
  return { weight: 20, reps: 8, rir: '2-3' }
}

function exercisesFromDay(day: RoutineDay): SessionExercise[] {
  return day.exercises
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, i) => {
      const exercise = getExercise(item.exerciseId)
      return {
        exerciseId: item.exerciseId,
        order: i + 1,
        isExtra: false,
        sets: exercise ? Array.from({ length: Math.max(1, item.targetSets) }, () => defaultSet(exercise)) : [],
      }
    })
}

export default function SessionEditor() {
  const { date: dateParam, sessionId } = useParams()
  const { sessions, routines, addSession, updateSession } = useAppStore()
  const navigate = useNavigate()

  const existing = sessionId ? sessions.find((s) => s.id === sessionId) : undefined
  const isNew = !sessionId

  const [session, setSession] = useState<WorkoutSession>(() => {
    if (existing) return existing
    return {
      id: newId('session'),
      date: dateParam ?? todayIso(),
      routineId: null,
      dayId: null,
      dayName: 'Entreno',
      dayColor: colorForDayIndex(0),
      exercises: [],
    }
  })

  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [query, setQuery] = useState('')
  const [freeform, setFreeform] = useState(!routines.length || Boolean(existing && !existing.routineId))
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(session.routineId)
  const [pendingDay, setPendingDay] = useState<{ routine: (typeof routines)[number]; day: RoutineDay } | null>(null)

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) ?? null
  useBodyScrollLock(pendingDay !== null)

  function chooseDay(routine: (typeof routines)[number], day: RoutineDay) {
    if (session.exercises.length > 0) {
      setPendingDay({ routine, day })
      return
    }
    applyDay(routine, day)
  }

  function applyDay(routine: (typeof routines)[number], day: RoutineDay) {
    setSession({
      ...session,
      routineId: routine.id,
      dayId: day.id,
      dayName: day.name,
      dayColor: day.color,
      exercises: exercisesFromDay(day),
    })
    setPendingDay(null)
  }

  const searchResults = useMemo(() => {
    if (!showPicker) return []
    return exercises.filter((e) => (e.section === 'main' || e.section === 'abs') && matchesExerciseQuery(e, query)).slice(0, 30)
  }, [query, showPicker])

  if (sessionId && !existing) {
    return (
      <div>
        <PageHeader title="Entrenamiento" onBack />
        <p className="px-4 text-base-400">No se encontró este entrenamiento.</p>
      </div>
    )
  }

  function updateExercise(index: number, patch: Partial<SessionExercise>) {
    const exercises2 = [...session.exercises]
    exercises2[index] = { ...exercises2[index], ...patch }
    setSession({ ...session, exercises: exercises2 })
  }

  function removeExercise(index: number) {
    setSession({ ...session, exercises: session.exercises.filter((_, i) => i !== index) })
  }

  function addExercise(exerciseId: string) {
    const exercise = getExercise(exerciseId)
    const next: SessionExercise = {
      exerciseId,
      order: session.exercises.length + 1,
      isExtra: true,
      sets: exercise ? [defaultSet(exercise)] : [],
    }
    setSession({ ...session, exercises: [...session.exercises, next] })
    setShowPicker(false)
    setQuery('')
  }

  function addSet(exIndex: number) {
    const ex = session.exercises[exIndex]
    const exercise = getExercise(ex.exerciseId)
    if (!exercise) return
    const last = ex.sets[ex.sets.length - 1]
    updateExercise(exIndex, { sets: [...ex.sets, last ? { ...last } : defaultSet(exercise)] })
  }

  function removeSet(exIndex: number, setIndex: number) {
    const ex = session.exercises[exIndex]
    updateExercise(exIndex, { sets: ex.sets.filter((_, i) => i !== setIndex) })
  }

  function updateSet(exIndex: number, setIndex: number, patch: Partial<SetEntry>) {
    const ex = session.exercises[exIndex]
    updateExercise(exIndex, { sets: ex.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)) })
  }

  function save() {
    if (isNew) addSession(session)
    else updateSession(session)
    navigate(`/calendar/${session.date}`, { replace: true })
  }

  return (
    <div className="pb-8">
      <PageHeader title={isNew ? 'Añadir entrenamiento' : 'Editar entrenamiento'} onBack />
      <div className="px-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-base-500 mb-2">Fecha</p>
          <input
            type="date"
            value={session.date}
            onChange={(e) => setSession({ ...session, date: e.target.value })}
            className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-base-500">Rutina y día</p>
            {routines.length > 0 && (
              <button className="text-xs text-brand font-semibold" onClick={() => setFreeform(!freeform)}>
                {freeform ? 'Elegir de una rutina' : 'Día libre en su lugar'}
              </button>
            )}
          </div>

          {!freeform && routines.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {routines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={() => setSelectedRoutineId(routine.id)}
                    className={`shrink-0 h-9 px-3 rounded-lg text-xs font-semibold border ${
                      selectedRoutineId === routine.id ? 'bg-base-100 text-base-950 border-base-100' : 'border-base-700 text-base-300'
                    }`}
                  >
                    {routine.name}
                  </button>
                ))}
              </div>
              {selectedRoutine && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedRoutine.days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => chooseDay(selectedRoutine, day)}
                      className="shrink-0 h-9 px-3 rounded-lg text-xs font-semibold border border-base-700 text-base-300"
                      style={
                        session.dayId === day.id
                          ? { background: day.color, borderColor: day.color, color: readableTextColor(day.color) }
                          : undefined
                      }
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              )}
              {session.dayId && (
                <p className="text-xs text-base-500">
                  Cargados los {session.exercises.length} ejercicios de <span className="text-base-300 font-semibold">{session.dayName}</span>. Puedes
                  editarlos o añadir más abajo.
                </p>
              )}
            </div>
          )}

          {(freeform || routines.length === 0) && (
            <>
              <input
                value={session.dayName}
                onChange={(e) => setSession({ ...session, dayName: e.target.value, routineId: null, dayId: null })}
                placeholder="Nombre del día (p. ej. Entreno libre)"
                className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100 mb-2"
              />
              <div className="flex gap-2">
                {[colorForDayIndex(0), colorForDayIndex(1), colorForDayIndex(2), colorForDayIndex(3), colorForDayIndex(4), colorForDayIndex(5)].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSession({ ...session, dayColor: c })}
                    className={`w-7 h-7 rounded-full border-2 ${session.dayColor === c ? 'border-base-100' : 'border-transparent'}`}
                    style={{ background: c }}
                    aria-label="Elegir color"
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2">Duración (min, opcional)</p>
          <Stepper
            value={session.durationMin ?? 0}
            onChange={(v) => setSession({ ...session, durationMin: v || undefined })}
            step={5}
            min={0}
            max={300}
            suffix="min"
            label="Duración"
          />
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2">Notas</p>
          <textarea
            value={session.notes ?? ''}
            onChange={(e) => setSession({ ...session, notes: e.target.value || undefined })}
            placeholder="Notas de la sesión (opcional)"
            className="w-full bg-base-800 border border-base-700 rounded-xl p-3 text-sm text-base-100 resize-none"
            rows={2}
          />
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Ejercicios</p>
          <div className="flex flex-col gap-2.5">
            {session.exercises.map((sessionEx, exIndex) => {
              const exercise = getExercise(sessionEx.exerciseId)
              if (!exercise) return null
              return (
                <Card key={`${sessionEx.exerciseId}-${exIndex}`} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-base-100 flex-1 min-w-0 truncate pr-2">{exercise.name}</p>
                    <button onClick={() => removeExercise(exIndex)} className="text-xs text-accent-push shrink-0 whitespace-nowrap">
                      Quitar ejercicio
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {sessionEx.sets.map((set, setIndex) => {
                      const key = `${exIndex}-${setIndex}`
                      const expanded = expandedKey === key
                      return (
                        <div key={key} className="rounded-xl bg-base-800/50">
                          <button
                            className="w-full flex items-center justify-between px-3 py-2 text-sm gap-2"
                            onClick={() => setExpandedKey(expanded ? null : key)}
                          >
                            <span className="text-base-500 shrink-0">Serie {setIndex + 1}</span>
                            <span className="font-semibold text-base-100 tabular flex-1 text-right">
                              {describeSet(exercise, set)} · RIR {set.rir}
                            </span>
                          </button>
                          {expanded && (
                            <div className="flex flex-col gap-4 px-3 pb-3">
                              {exercise.logType === 'weight-reps' && (
                                <>
                                  <div>
                                    <p className="text-xs text-base-500 mb-2">Peso</p>
                                    <Stepper
                                      value={set.weight ?? 0}
                                      onChange={(v) => updateSet(exIndex, setIndex, { weight: v })}
                                      step={exercise.weightIncrement || 1}
                                      suffix="kg"
                                      decimals={(set.weight ?? 0) % 1 !== 0 ? 1 : 0}
                                      keypadDecimals={1}
                                      label="Peso"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs text-base-500 mb-2">Repeticiones</p>
                                    <Stepper value={set.reps ?? 0} onChange={(v) => updateSet(exIndex, setIndex, { reps: v })} step={1} suffix="reps" label="Repeticiones" />
                                  </div>
                                </>
                              )}
                              {exercise.logType === 'bodyweight-reps' && (
                                <>
                                  <div>
                                    <p className="text-xs text-base-500 mb-2">Repeticiones</p>
                                    <Stepper value={set.reps ?? 0} onChange={(v) => updateSet(exIndex, setIndex, { reps: v })} step={1} suffix="reps" label="Repeticiones" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-base-500 mb-2">Lastre añadido (opcional)</p>
                                    <Stepper
                                      value={set.extraWeight ?? 0}
                                      onChange={(v) => updateSet(exIndex, setIndex, { extraWeight: v || undefined })}
                                      step={2.5}
                                      suffix="kg"
                                      label="Lastre"
                                    />
                                  </div>
                                </>
                              )}
                              {exercise.logType === 'time' && (
                                <div>
                                  <p className="text-xs text-base-500 mb-2">Duración mantenida</p>
                                  <Stepper value={set.durationSec ?? 0} onChange={(v) => updateSet(exIndex, setIndex, { durationSec: v })} step={5} min={0} suffix="s" label="Duración" />
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-base-500 mb-2">RIR</p>
                                <RIRSelector value={set.rir} onChange={(v) => updateSet(exIndex, setIndex, { rir: v })} />
                              </div>
                              <button onClick={() => removeSet(exIndex, setIndex)} className="text-xs text-accent-push text-left">
                                Quitar esta serie
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => addSet(exIndex)} className="text-xs text-brand font-semibold mt-2">
                    + Añadir serie
                  </button>
                </Card>
              )
            })}
          </div>
        </div>

        {!showPicker && (
          <Button variant="secondary" size="lg" className="w-full" onClick={() => setShowPicker(true)}>
            + Añadir ejercicio
          </Button>
        )}

        {showPicker && (
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o músculo..."
              className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
            />
            <div className="flex flex-col gap-2">
              {searchResults.map((ex) => (
                <button key={ex.id} onClick={() => addExercise(ex.id)} className="text-left">
                  <Card className="active:bg-base-800 p-3">
                    <p className="font-semibold text-base-100">{ex.name}</p>
                    <p className="text-xs text-base-500">
                      {ex.mainMuscles.join(', ')} · {equipmentLabels[ex.equipment]}
                    </p>
                  </Card>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setShowPicker(false)}>
              Cancelar
            </Button>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={save}>
          Guardar
        </Button>
      </div>

      {pendingDay && (
        <ActionSheet onDismiss={() => setPendingDay(null)}>
          <p className="text-lg font-bold mb-1">¿Sustituir los ejercicios?</p>
          <p className="text-sm text-base-400 mb-5">
            Ya tienes {session.exercises.length} ejercicio{session.exercises.length === 1 ? '' : 's'} en este entrenamiento. Cargar{' '}
            <span className="text-base-200 font-semibold">{pendingDay.day.name}</span> los sustituirá por los de ese día.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button variant="danger" size="lg" onClick={() => applyDay(pendingDay.routine, pendingDay.day)}>
              Sustituir ejercicios
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setPendingDay(null)}>
              Cancelar
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
