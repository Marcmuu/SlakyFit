import { useState } from 'react'
import { useAppStore } from '../../data/store'
import { formatDayLabel, formatWeight, todayIso } from '../../lib/format'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Stepper from '../../components/Stepper'
import TrendLineChart from '../../components/charts/TrendLineChart'

export default function BodyTab() {
  const { bodyMetrics, addBodyMetric, profile, updateProfile } = useAppStore()
  const [weight, setWeight] = useState(profile.weightKg || 80)

  const sorted = [...bodyMetrics].sort((a, b) => (a.date < b.date ? -1 : 1))
  const chartData = sorted.map((m) => ({ x: formatDayLabel(m.date).split(' ')[0], y: m.weight }))
  const latest = sorted[sorted.length - 1]

  function logToday() {
    addBodyMetric({ date: todayIso(), weight })
    updateProfile({ ...profile, weightKg: weight })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center py-4">
          <p className="text-xs text-base-500 mb-1">Peso actual</p>
          <p className="text-2xl font-bold tabular">{latest ? `${formatWeight(latest.weight)} kg` : '—'}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-xs text-base-500 mb-1">Altura</p>
          <p className="text-2xl font-bold tabular">{profile.heightCm} cm</p>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-bold mb-3">Histórico de peso</p>
        <TrendLineChart data={chartData} unit=" kg" />
      </Card>

      <Card>
        <p className="text-sm font-bold mb-1">Registrar peso de hoy</p>
        <p className="text-xs text-base-500 mb-3">Toca el número para escribirlo directamente</p>
        <div className="flex items-center justify-between gap-3">
          <Stepper value={weight} onChange={setWeight} step={0.1} min={30} max={250} suffix="kg" decimals={1} label="Peso de hoy" />
          <Button onClick={logToday}>Guardar</Button>
        </div>
      </Card>
    </div>
  )
}
