import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { exercises, getExercise } from '../../data/exercises'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import { equipmentLabels } from '../../lib/equipmentLabels'
import { newId } from '../../lib/id'
import { colorForDayIndex, readableTextColor } from '../../lib/color'
import { todayIso } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Stepper from '../../components/Stepper'
import RIRSelector from '../../components/RIRSelector'
import { describeSet } from '../../lib/setFormat'
import type { Exercise, SessionExercise, SetEntry, WorkoutSession } from '../../types'

function defaultSet(exercise: Exercise): SetEntry {
  if (exercise.logType === 'time') return { durationSec: exercise.defaultDurationSec ?? 30, rir: '2-3' }
  if (exercise.logType === 'bodyweight-reps') return { reps: 8, rir: '2-3' }
  return { weight: 20, reps: 8, rir: '2-3' }
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

  const dayOptions = useMemo(() => {
    const flat: { label: string; dayName: string; color: string }[] = []
    for (const routine of routines) {
      for (const day of routine.days) {
        flat.push({ label: `${routine.name} · ${day.name}`, dayName: day.name, color: day.color })
      }
    }
    return flat
  }, [routines])

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
          <p className="text-xs text-base-500 mb-2">Día</p>
          {dayOptions.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {dayOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSession({ ...session, dayName: opt.dayName, dayColor: opt.color })}
                  className="shrink-0 h-9 px-3 rounded-lg text-xs font-semibold border border-base-700 text-base-300"
                  style={
                    session.dayName === opt.dayName && session.dayColor === opt.color
                      ? { background: opt.color, borderColor: opt.color, color: readableTextColor(opt.color) }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <input
            value={session.dayName}
            onChange={(e) => setSession({ ...session, dayName: e.target.value })}
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
    </div>
  )
}
