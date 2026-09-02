import { useNavigate, useParams } from 'react-router-dom'
import { routineLists } from '../../data/routineLists'
import { exercises } from '../../data/exercises'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import type { ExerciseSection } from '../../types'

const titles: Record<string, string> = { abs: 'ABS', mobility: 'Movilidad', flexibility: 'Flexibilidad' }

export default function RoutineListScreen() {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const sectionKey = (section ?? 'abs') as ExerciseSection
  const lists = routineLists.filter((r) => r.section === sectionKey)
  const soloExercises = exercises.filter((e) => e.section === sectionKey)

  return (
    <div>
      <PageHeader title={titles[sectionKey] ?? sectionKey} onBack />
      <div className="px-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-base-500 uppercase tracking-wide mb-2">Rutinas</p>
          <div className="flex flex-col gap-2">
            {lists.map((list) => (
              <button key={list.id} onClick={() => navigate(`/more/routine/${list.id}`)} className="text-left">
                <Card className="active:bg-base-800 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-base-100 truncate">{list.name}</p>
                    <p className="text-xs text-base-500 truncate">{list.durationLabel} · {list.exerciseIds.length} ejercicios</p>
                  </div>
                  <span className="text-base-600 shrink-0">›</span>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-base-500 uppercase tracking-wide mb-2">Ejercicios individuales</p>
          <div className="flex flex-col gap-2">
            {soloExercises.map((ex) => (
              <button key={ex.id} onClick={() => navigate(`/library/${ex.id}`)} className="text-left">
                <Card className="active:bg-base-800 p-3 flex items-center justify-between">
                  <p className="font-medium text-base-100 flex-1 min-w-0 truncate pr-2">{ex.name}</p>
                  <span className="text-base-600 shrink-0">›</span>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
