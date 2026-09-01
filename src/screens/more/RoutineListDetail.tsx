import { useNavigate, useParams } from 'react-router-dom'
import { getRoutineList } from '../../data/routineLists'
import { getExercise } from '../../data/exercises'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import ExerciseMedia from '../../components/ExerciseMedia'

export default function RoutineListDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const list = id ? getRoutineList(id) : undefined

  if (!list) {
    return (
      <div>
        <PageHeader title="Rutina" onBack />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={list.name} subtitle={`${list.durationLabel} · ${list.exerciseIds.length} ejercicios`} onBack />
      <div className="px-4 flex flex-col gap-3">
        {list.exerciseIds.map((exId, i) => {
          const exercise = getExercise(exId)
          if (!exercise) return null
          return (
            <button key={exId} onClick={() => navigate(`/library/${exId}`)} className="text-left">
              <Card className="active:bg-base-800 p-3 flex items-center gap-3">
                <div className="w-16 shrink-0">
                  <ExerciseMedia exercise={exercise} compact />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-500">Paso {i + 1}</p>
                  <p className="font-semibold text-base-100 truncate">{exercise.name}</p>
                  {exercise.defaultDurationSec && <p className="text-xs text-base-500">{exercise.defaultDurationSec} s</p>}
                </div>
                <span className="text-base-600">›</span>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
