import { useEffect, useState } from 'react'
import Card from './Card'

const PRESETS = [30, 60, 120, 180]

function formatPreset(sec: number): string {
  return sec < 60 ? `${sec}s` : `${sec / 60}min`
}

// `trigger` sube cada vez que se guarda una serie; ese cambio es la señal
// para (re)ofrecer el descanso, sin acoplar este componente al resto del formulario.
export default function RestTimer({ trigger }: { trigger: number }) {
  const [duration, setDuration] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (trigger === 0) return
    setShowPicker(true)
    setDuration(null)
    setRemaining(0)
  }, [trigger])

  useEffect(() => {
    if (duration === null || remaining <= 0) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [duration, remaining])

  useEffect(() => {
    if (duration !== null && remaining === 0) {
      navigator.vibrate?.(200)
    }
  }, [remaining, duration])

  if (!showPicker && duration === null) return null

  function start(seconds: number) {
    setDuration(seconds)
    setRemaining(seconds)
    setShowPicker(false)
  }

  function adjust(delta: number) {
    setRemaining((r) => Math.max(0, r + delta))
  }

  function stop() {
    setDuration(null)
    setShowPicker(false)
  }

  if (showPicker) {
    return (
      <Card className="border-brand/30 bg-brand/5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-base-100">¿Descanso antes de la próxima serie?</p>
          <button onClick={() => setShowPicker(false)} className="text-xs text-base-400 shrink-0 ml-2">
            Cerrar
          </button>
        </div>
        <div className="flex gap-2">
          {PRESETS.map((sec) => (
            <button
              key={sec}
              onClick={() => start(sec)}
              className="flex-1 h-11 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-100 active:bg-base-700"
            >
              {formatPreset(sec)}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  const finished = remaining === 0
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <Card className={finished ? 'border-brand bg-brand/10' : 'border-brand/30 bg-brand/5'}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-brand uppercase tracking-wide">{finished ? 'Descanso terminado' : 'Descanso'}</p>
        <button onClick={stop} className="text-xs text-base-400">
          {finished ? 'Cerrar' : 'Saltar'}
        </button>
      </div>
      <p className="text-4xl font-extrabold tabular text-center mb-3">
        {mm}:{ss}
      </p>
      {!finished && (
        <div className="flex gap-2">
          <button onClick={() => adjust(-15)} className="flex-1 h-10 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700">
            -15s
          </button>
          <button onClick={() => adjust(15)} className="flex-1 h-10 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700">
            +15s
          </button>
        </div>
      )}
    </Card>
  )
}
