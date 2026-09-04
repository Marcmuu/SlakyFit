import { useState } from 'react'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import Card from '../../components/Card'
import Button from '../../components/Button'
import type { Goal } from '../../types'

export default function GoalsTab() {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [current, setCurrent] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('kg')

  function openNew() {
    setEditingId(null)
    setLabel('')
    setCurrent('')
    setTarget('')
    setUnit('kg')
    setShowForm(true)
  }

  function openEdit(goal: Goal) {
    setEditingId(goal.id)
    setLabel(goal.label)
    setCurrent(String(goal.current))
    setTarget(String(goal.target))
    setUnit(goal.unit)
    setShowForm(true)
  }

  function submit() {
    if (!label.trim() || !target) return
    if (editingId) {
      updateGoal({
        id: editingId,
        type: 'exercise-reps',
        label: label.trim(),
        current: Number(current) || 0,
        target: Number(target),
        unit,
      })
    } else {
      addGoal({
        id: newId('goal'),
        type: 'exercise-reps',
        label: label.trim(),
        current: Number(current) || 0,
        target: Number(target),
        unit,
      })
    }
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => {
        const pct = goal.target === 0 ? 0 : Math.min(100, Math.round((goal.current / goal.target) * 100))
        return (
          <Card key={goal.id}>
            <button className="w-full text-left" onClick={() => openEdit(goal)}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-base-100 flex-1 min-w-0 truncate pr-2">{goal.label}</p>
              </div>
              <div className="flex items-center justify-between text-sm tabular mb-2">
                <span className="text-base-400">
                  {goal.current} {goal.unit}
                </span>
                <span className="text-base-500">
                  Meta: {goal.target} {goal.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-base-800 overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </button>
            <div className="flex gap-4 mt-3 pt-3 border-t border-base-800 text-xs font-semibold">
              <button className="text-brand" onClick={() => openEdit(goal)}>
                Editar
              </button>
              <button className="text-accent-push" onClick={() => deleteGoal(goal.id)}>
                Eliminar
              </button>
            </div>
          </Card>
        )
      })}

      {!showForm && (
        <Button variant="secondary" size="lg" onClick={openNew}>
          + Nuevo objetivo
        </Button>
      )}

      {showForm && (
        <Card className="flex flex-col gap-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nombre del objetivo (ej. Dominadas)"
            className="h-11 bg-base-800 border border-base-700 rounded-xl px-3 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Actual"
              inputMode="decimal"
              className="w-full min-w-0 h-11 bg-base-800 border border-base-700 rounded-xl px-2.5 text-sm text-center"
            />
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Meta"
              inputMode="decimal"
              className="w-full min-w-0 h-11 bg-base-800 border border-base-700 rounded-xl px-2.5 text-sm text-center"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unidad"
              className="w-full min-w-0 h-11 bg-base-800 border border-base-700 rounded-xl px-2.5 text-sm text-center"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={submit}>
              Guardar
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
