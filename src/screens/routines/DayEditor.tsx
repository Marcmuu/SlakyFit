import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { getAllExercises, getExercise } from '../../data/exercises'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import { equipmentLabels } from '../../lib/equipmentLabels'
import { newId } from '../../lib/id'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Stepper from '../../components/Stepper'
import CreateExerciseSheet from '../../components/CreateExerciseSheet'
import type { RoutineDayExercise } from '../../types'

export default function DayEditor() {
  const { routineId, dayId } = useParams()
  const { routines, updateRoutine } = useAppStore()
  const navigate = useNavigate()
  const routine = routines.find((r) => r.id === routineId)
  const day = routine?.days.find((d) => d.id === dayId)
  const [name, setName] = useState(day?.name ?? '')
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const searchResults = useMemo(() => {
    if (!showPicker) return []
    return getAllExercises().filter((e) => (e.section === 'main' || e.section === 'abs') && matchesExerciseQuery(e, query)).slice(0, 30)
  }, [query, showPicker])

  if (!routine || !day) {
    return (
      <div>
        <PageHeader title="Día" onBack />
        <p className="px-4 text-base-400">No se encontró este día.</p>
      </div>
    )
  }

  const slots = [...day.exercises].sort((a, b) => a.order - b.order)

  function saveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === day!.name) return
    updateRoutine({
      ...routine!,
      days: routine!.days.map((d) => (d.id === day!.id ? { ...d, name: trimmed } : d)),
      updatedAt: new Date().toISOString(),
    })
  }

  function updateDayExercises(nextExercises: RoutineDayExercise[]) {
    updateRoutine({
      ...routine!,
      days: routine!.days.map((d) => (d.id === day!.id ? { ...d, exercises: nextExercises } : d)),
      updatedAt: new Date().toISOString(),
    })
  }

  function moveSlot(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= slots.length) return
    const reordered = [...slots]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    updateDayExercises(reordered.map((s, i) => ({ ...s, order: i + 1 })))
  }

  function removeSlot(slotId: string) {
    updateDayExercises(slots.filter((s) => s.id !== slotId).map((s, i) => ({ ...s, order: i + 1 })))
  }

  function updateSlot(slotId: string, patch: Partial<RoutineDayExercise>) {
    updateDayExercises(slots.map((s) => (s.id === slotId ? { ...s, ...patch } : s)))
  }

  function addExercise(exerciseId: string) {
    const isTime = getExercise(exerciseId)?.logType === 'time'
    const slot: RoutineDayExercise = {
      id: newId('slot'),
      exerciseId,
      order: slots.length + 1,
      targetSets: 3,
      repMin: isTime ? 20 : 8,
      repMax: isTime ? 40 : 12,
    }
    updateDayExercises([...slots, slot])
    setShowPicker(false)
    setQuery('')
  }

  return (
    <div className="pb-8">
      <PageHeader title="Editar día" onBack />
      <div className="px-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-base-500 mb-2">Nombre del día</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100 font-semibold"
          />
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Ejercicios</p>
          <div className="flex flex-col gap-2.5">
            {slots.map((slot, index) => {
              const exercise = getExercise(slot.exerciseId)
              if (!exercise) return null
              const expanded = expandedSlotId === slot.id
              return (
                <Card key={slot.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => moveSlot(index, -1)}
                        className="w-6 h-6 flex items-center justify-center text-base-500 disabled:opacity-20"
                      >
                        ▲
                      </button>
                      <button
                        disabled={index === slots.length - 1}
                        onClick={() => moveSlot(index, 1)}
                        className="w-6 h-6 flex items-center justify-center text-base-500 disabled:opacity-20"
                      >
                        ▼
                      </button>
                    </div>
                    <button className="flex-1 min-w-0 text-left" onClick={() => setExpandedSlotId(expanded ? null : slot.id)}>
                      <p className="font-semibold text-base-100 truncate">{exercise.name}</p>
                      <p className="text-xs text-base-500 tabular">
                        {slot.targetSets} × {slot.repMin}-{slot.repMax}
                        {exercise.logType === 'time' ? 's' : ' reps'}
                      </p>
                    </button>
                    <button onClick={() => removeSlot(slot.id)} className="text-xs text-accent-push shrink-0">
                      Quitar
                    </button>
                  </div>

                  {expanded && (
                    <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-base-800">
                      <div>
                        <p className="text-xs text-base-500 mb-2">Series objetivo</p>
                        <Stepper value={slot.targetSets} onChange={(v) => updateSlot(slot.id, { targetSets: v })} step={1} min={1} max={10} label="Series" />
                      </div>
                      <div>
                        <p className="text-xs text-base-500 mb-2">{exercise.logType === 'time' ? 'Duración mínima (s)' : 'Repeticiones mínimas'}</p>
                        <Stepper
                          value={slot.repMin}
                          onChange={(v) => updateSlot(slot.id, { repMin: v, repMax: Math.max(v, slot.repMax) })}
                          step={exercise.logType === 'time' ? 5 : 1}
                          min={1}
                          max={exercise.logType === 'time' ? 600 : 50}
                          label="Mínimo"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-base-500 mb-2">{exercise.logType === 'time' ? 'Duración máxima (s)' : 'Repeticiones máximas'}</p>
                        <Stepper
                          value={slot.repMax}
                          onChange={(v) => updateSlot(slot.id, { repMax: v, repMin: Math.min(v, slot.repMin) })}
                          step={exercise.logType === 'time' ? 5 : 1}
                          min={1}
                          max={exercise.logType === 'time' ? 600 : 50}
                          label="Máximo"
                        />
                      </div>
                    </div>
                  )}
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
            <button onClick={() => setShowCreate(true)} className="text-sm text-brand font-semibold underline underline-offset-2 text-center">
              ¿No lo encuentras? Créalo
            </button>
            <Button variant="ghost" onClick={() => setShowPicker(false)}>
              Cancelar
            </Button>
          </div>
        )}

        {showCreate && (
          <CreateExerciseSheet
            onClose={() => setShowCreate(false)}
            onCreated={(id) => {
              setShowCreate(false)
              addExercise(id)
            }}
          />
        )}

        <Button size="lg" className="w-full" onClick={() => navigate(`/routines/${routine.id}`)}>
          Volver a la rutina
        </Button>
      </div>
    </div>
  )
}
