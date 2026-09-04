import { useAppStore } from '../../data/store'
import { currentPhase, currentWeekNumber } from '../../lib/programWeek'
import { formatDayLabel } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

export default function Programs() {
  const { program } = useAppStore()
  if (!program) {
    return (
      <div>
        <PageHeader title="Programas" onBack />
      </div>
    )
  }
  const week = currentWeekNumber(program)
  const phase = currentPhase(program)

  return (
    <div>
      <PageHeader title="Programas" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <p className="text-xs text-brand font-semibold mb-1">Programa actual</p>
          <h2 className="text-xl font-extrabold mb-3">{program.name}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-base-500">Duración</p>
              <p className="font-semibold">{program.durationWeeks} semanas</p>
            </div>
            <div>
              <p className="text-base-500">Semana</p>
              <p className="font-semibold">{week} de {program.durationWeeks}</p>
            </div>
            <div>
              <p className="text-base-500">Fase actual</p>
              <p className="font-semibold">{phase.name}</p>
            </div>
            <div>
              <p className="text-base-500">Inicio</p>
              <p className="font-semibold">{formatDayLabel(program.startDate)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold mb-3">Fases del programa</p>
          <div className="flex flex-col divide-y divide-base-800">
            {program.phases.map((p) => (
              <div key={p.name} className={`py-3 ${p.name === phase.name ? 'opacity-100' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-base-100">{p.name}</p>
                  <span className="text-xs text-base-500">Semanas {p.weekStart}-{p.weekEnd}</span>
                </div>
                <p className="text-xs text-base-500">
                  Compuestos RIR {p.rirTargets.compoundMain[0]}-{p.rirTargets.compoundMain[1]} · Aislamientos RIR {p.rirTargets.isolation[0]}-{p.rirTargets.isolation[1]}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold mb-2">Historial de programas</p>
          <p className="text-sm text-base-500">Todavía no hay programas anteriores. Cuando cambies de programa, quedará aquí registrado sin borrar tus entrenos.</p>
        </Card>
      </div>
    </div>
  )
}
