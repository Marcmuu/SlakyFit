import { useAppStore } from '../../data/store'
import { totalSets, totalVolume, volumeByMuscle, averageSessionsPerWeek } from '../../data/analytics'
import { countSessionsThisWeek } from '../../data/recommendation'
import Card from '../../components/Card'
import CategoryBarChart from '../../components/charts/CategoryBarChart'

export default function TrainingTab() {
  const { sessions } = useAppStore()
  const volumeData = volumeByMuscle(sessions).map((v) => ({ label: v.label, value: v.value }))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center py-4">
          <p className="text-xs text-base-500 mb-1">Entrenamientos</p>
          <p className="text-2xl font-bold tabular">{sessions.length}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-xs text-base-500 mb-1">Esta semana</p>
          <p className="text-2xl font-bold tabular">{countSessionsThisWeek(sessions)}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-xs text-base-500 mb-1">Series totales</p>
          <p className="text-2xl font-bold tabular">{totalSets(sessions)}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-xs text-base-500 mb-1">Frecuencia media</p>
          <p className="text-2xl font-bold tabular">{averageSessionsPerWeek(sessions)}/sem</p>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-bold mb-1">Volumen por músculo</p>
        <p className="text-xs text-base-500 mb-2">kg totales movidos (peso × reps)</p>
        <CategoryBarChart data={volumeData} unit=" kg" />
      </Card>

      <Card className="text-center py-4">
        <p className="text-xs text-base-500 mb-1">Volumen acumulado</p>
        <p className="text-2xl font-bold tabular">{totalVolume(sessions).toLocaleString('es-ES')} kg</p>
      </Card>
    </div>
  )
}
