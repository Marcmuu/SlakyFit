import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { volumeByMuscleForRoutine, lowVolumeMuscles, stagnantExercisesInRoutine } from '../../data/routineAnalysis'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import CategoryBarChart from '../../components/charts/CategoryBarChart'

export default function AnalyzeRoutine() {
  const { routines, activeRoutineId, sessions } = useAppStore()
  const navigate = useNavigate()
  const routine = routines.find((r) => r.id === activeRoutineId) ?? routines[0]

  if (!routine) {
    return (
      <div>
        <PageHeader title="Analizar rutina" onBack />
        <div className="px-4">
          <Card className="text-center py-8">
            <p className="text-base-400 mb-4">Todavía no tienes ninguna rutina que analizar.</p>
            <Button onClick={() => navigate('/routines')}>Crear una rutina</Button>
          </Card>
          <button onClick={() => navigate('/routines/ai-export')} className="text-sm text-brand font-semibold underline underline-offset-2 text-center block w-full mt-4">
            O pide a una IA que te proponga una a partir de tu perfil
          </button>
        </div>
      </div>
    )
  }

  if (routine.days.length === 0 || routine.days.every((d) => d.exercises.length === 0)) {
    return (
      <div>
        <PageHeader title="Analizar rutina" subtitle={routine.name} onBack />
        <div className="px-4">
          <Card className="text-center py-8">
            <p className="text-base-400 mb-4">"{routine.name}" todavía no tiene ejercicios en sus días.</p>
            <Button onClick={() => navigate(`/routines/${routine.id}`)}>Editar rutina</Button>
          </Card>
        </div>
      </div>
    )
  }

  const volume = volumeByMuscleForRoutine(routine)
  const lowVolume = lowVolumeMuscles(routine)
  const stagnant = stagnantExercisesInRoutine(routine, sessions)

  return (
    <div className="pb-8">
      <PageHeader title="Analizar rutina" subtitle={routine.name} onBack />
      <div className="px-4 flex flex-col gap-4">
        <button onClick={() => navigate('/routines/ai-export')} className="text-left">
          <Card className="active:bg-base-800 !border-brand/40 !bg-brand/5">
            <p className="text-sm font-bold text-brand mb-1">Analizar a fondo con IA</p>
            <p className="text-xs text-base-400">
              Exporta tu rutina, historial y objetivos listos para pegar en ChatGPT o Claude, y trae de vuelta sus sugerencias.
            </p>
          </Card>
        </button>

        <Card>
          <p className="text-sm font-bold mb-1">Series por músculo (un ciclo completo)</p>
          <p className="text-xs text-base-500 mb-2">Sumando las series objetivo de cada ejercicio de {routine.days.length} días</p>
          <CategoryBarChart data={volume} unit=" series" />
        </Card>

        {lowVolume.length > 0 ? (
          <Card className="border-accent-warning/40 bg-accent-warning/5">
            <p className="text-sm font-bold text-accent-warning mb-2">Posible volumen bajo</p>
            <p className="text-sm text-base-300 mb-2">
              Estos músculos reciben menos de 6 series por ciclo completo de la rutina — puede que no sea suficiente estímulo para progresar:
            </p>
            <div className="flex flex-wrap gap-2">
              {lowVolume.map((m) => (
                <span key={m.label} className="text-xs font-semibold text-base-200 bg-base-800 px-2.5 py-1 rounded-full capitalize">
                  {m.label} · {m.value} serie{m.value === 1 ? '' : 's'}
                </span>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm font-bold mb-1">Volumen por músculo</p>
            <p className="text-sm text-base-400">Ningún músculo está claramente por debajo del mínimo orientativo. Buen reparto.</p>
          </Card>
        )}

        <Card>
          <p className="text-sm font-bold mb-1">Ejercicios sin progreso reciente</p>
          <p className="text-xs text-base-500 mb-3">Comparando tu e1RM más reciente con el de hace 3 sesiones de ese ejercicio</p>
          {stagnant.length === 0 ? (
            <p className="text-sm text-base-400">
              {sessions.length === 0
                ? 'Todavía no hay historial suficiente para comparar.'
                : 'Nada estancado por ahora — los ejercicios con historial muestran progreso.'}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-base-800">
              {stagnant.map((s) => (
                <button
                  key={s.exerciseId}
                  onClick={() => navigate(`/library/${s.exerciseId}`)}
                  className="py-2.5 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-base-100">{s.exerciseName}</span>
                  <span className="text-base-600">›</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
