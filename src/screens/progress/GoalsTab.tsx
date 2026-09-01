import { useState } from 'react'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function GoalsTab() {
  const { goals, addGoal, deleteGoal } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [current, setCurrent] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('kg')

  function submit() {
    if (!label.trim() || !target) return
    addGoal({
      id: newId('goal'),
      type: 'exercise-reps',
      label: label.trim(),
      current: Number(current) || 0,
      target: Number(target),
      unit,
    })
    setLabel('')
    setCurrent('')
    setTarget('')
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => {
        const pct = goal.target === 0 ? 0 : Math.min(100, Math.round((goal.current / goal.target) * 100))
        return (
          <Card key={goal.id}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-base-100">{goal.label}</p>
              <button onClick={() => deleteGoal(goal.id)} className="text-xs text-accent-push">
                Eliminar
              </button>
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
          </Card>
        )
      })}

      {!showForm && (
        <Button variant="secondary" size="lg" onClick={() => setShowForm(true)}>
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
            <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>
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
