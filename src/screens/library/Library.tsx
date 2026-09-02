import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exercises } from '../../data/exercises'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import { equipmentLabels } from '../../lib/equipmentLabels'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import type { Muscle, Equipment } from '../../types'

const muscles: Muscle[] = ['pecho', 'espalda', 'hombro', 'biceps', 'triceps', 'cuadriceps', 'isquios', 'gluteo', 'gemelos', 'core']
const equipmentOptions: Equipment[] = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'smith']

export default function Library() {
  const navigate = useNavigate()
  const [muscle, setMuscle] = useState<Muscle | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    return exercises.filter(
      (e) =>
        (e.section === 'main' || e.section === 'abs') &&
        (!muscle || e.mainMuscles.includes(muscle)) &&
        (!equipment || e.equipment === equipment) &&
        matchesExerciseQuery(e, query),
    )
  }, [muscle, equipment, query])

  return (
    <div>
      <PageHeader title="Ejercicios" subtitle={`${results.length} en la biblioteca`} />
      <div className="px-4 flex flex-col gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o músculo (ej. abs, pierna)..."
          className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(muscle === m ? null : m)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold capitalize border ${
                muscle === m ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {equipmentOptions.map((eq) => (
            <button
              key={eq}
              onClick={() => setEquipment(equipment === eq ? null : eq)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold border ${
                equipment === eq ? 'bg-base-100 text-base-950 border-base-100' : 'border-base-700 text-base-300'
              }`}
            >
              {equipmentLabels[eq]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {results.map((ex) => (
            <button key={ex.id} onClick={() => navigate(`/library/${ex.id}`)} className="text-left">
              <Card className="active:bg-base-800 p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-base-100 truncate">{ex.name}</p>
                  <p className="text-xs text-base-500 capitalize truncate">{ex.mainMuscles.join(', ')} · {equipmentLabels[ex.equipment]}</p>
                </div>
                <span className="text-base-600 shrink-0">›</span>
              </Card>
            </button>
          ))}
          {results.length === 0 && <p className="text-center text-base-500 py-8 text-sm">No hay ejercicios con estos filtros.</p>}
        </div>
      </div>
    </div>
  )
}
