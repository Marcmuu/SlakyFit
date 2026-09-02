import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import { colorForDayIndex } from '../../lib/color'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import type { RoutineDay } from '../../types'

export default function RoutineEditor() {
  const { routineId } = useParams()
  const { routines, updateRoutine } = useAppStore()
  const navigate = useNavigate()
  const routine = routines.find((r) => r.id === routineId)
  const [name, setName] = useState(routine?.name ?? '')

  if (!routine) {
    return (
      <div>
        <PageHeader title="Rutina" onBack />
        <p className="px-4 text-base-400">No se encontró esta rutina.</p>
      </div>
    )
  }

  const days = [...routine.days].sort((a, b) => a.order - b.order)

  function saveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === routine!.name) return
    updateRoutine({ ...routine!, name: trimmed, updatedAt: new Date().toISOString() })
  }

  function addDay() {
    const day: RoutineDay = {
      id: newId('day'),
      name: `Día ${days.length + 1}`,
      order: days.length + 1,
      color: colorForDayIndex(days.length),
      exercises: [],
    }
    updateRoutine({ ...routine!, days: [...routine!.days, day], updatedAt: new Date().toISOString() })
    navigate(`/routines/${routine!.id}/day/${day.id}`)
  }

  function moveDay(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= days.length) return
    const reordered = [...days]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    updateRoutine({
      ...routine!,
      days: reordered.map((d, i) => ({ ...d, order: i + 1 })),
      updatedAt: new Date().toISOString(),
    })
  }

  function removeDay(dayId: string) {
    updateRoutine({
      ...routine!,
      days: routine!.days.filter((d) => d.id !== dayId).map((d, i) => ({ ...d, order: i + 1 })),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="pb-8">
      <PageHeader title="Editar rutina" onBack />
      <div className="px-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-base-500 mb-2">Nombre de la rutina</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100 font-semibold"
          />
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Días</p>
          <div className="flex flex-col gap-2.5">
            {days.map((day, index) => (
              <Card key={day.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => moveDay(index, -1)}
                      className="w-6 h-6 flex items-center justify-center text-base-500 disabled:opacity-20"
                    >
                      ▲
                    </button>
                    <button
                      disabled={index === days.length - 1}
                      onClick={() => moveDay(index, 1)}
                      className="w-6 h-6 flex items-center justify-center text-base-500 disabled:opacity-20"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: day.color }} />
                  <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/routines/${routine.id}/day/${day.id}`)}>
                    <p className="font-semibold text-base-100 truncate">{day.name}</p>
                    <p className="text-xs text-base-500">
                      {day.exercises.length} ejercicio{day.exercises.length === 1 ? '' : 's'}
                    </p>
                  </button>
                  <button onClick={() => removeDay(day.id)} className="text-xs text-accent-push shrink-0">
                    Quitar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button variant="secondary" size="lg" className="w-full" onClick={addDay}>
          + Añadir día
        </Button>
      </div>
    </div>
  )
}
