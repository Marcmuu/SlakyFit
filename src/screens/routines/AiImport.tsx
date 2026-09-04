import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { parseAiRoutineProposal, applyAiRoutineProposal } from '../../data/aiExchange'
import type { AiRoutineProposal } from '../../data/aiExchange'
import { getExercise } from '../../data/exercises'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function AiImport() {
  const { addRoutine } = useAppStore()
  const navigate = useNavigate()
  const [raw, setRaw] = useState('')
  const [preview, setPreview] = useState<AiRoutineProposal | null>(null)
  const [error, setError] = useState<string | null>(null)

  function previewIt() {
    setError(null)
    try {
      setPreview(parseAiRoutineProposal(raw))
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'No se pudo interpretar el texto.')
    }
  }

  function save() {
    if (!preview) return
    const routine = applyAiRoutineProposal(preview)
    addRoutine(routine)
    // replace, no push: si el usuario pulsa "atrás" desde aquí no tiene
    // sentido volver a la pantalla de pegar/importar — mejor que aterrice en
    // Mis rutinas, donde ya puede ver y activar la que se acaba de crear.
    navigate('/routines', { replace: true })
  }

  return (
    <div className="pb-8">
      <PageHeader title="Importar cambios de la IA" onBack={() => (preview ? setPreview(null) : navigate(-1))} />
      <div className="px-4 flex flex-col gap-4">
        {!preview && (
          <>
            <Card>
              <p className="text-sm text-base-300">
                Pega aquí la respuesta completa que te dio la IA (el análisis y el bloque de código al final). Solo se usa el bloque JSON del
                final — el resto lo puedes dejar pegado sin problema.
              </p>
            </Card>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Pega aquí la respuesta de la IA..."
              rows={10}
              className="w-full bg-base-800 border border-base-700 rounded-xl px-4 py-3 text-sm text-base-100"
            />
            {error && <p className="text-sm text-accent-push">{error}</p>}
            <Button size="lg" className="w-full" onClick={previewIt} disabled={!raw.trim()}>
              Previsualizar
            </Button>
          </>
        )}

        {preview && (
          <>
            <Card>
              <p className="text-lg font-bold mb-1">{preview.routineName}</p>
              {preview.summary && <p className="text-sm text-base-400">{preview.summary}</p>}
            </Card>

            {preview.days.map((day, i) => (
              <Card key={i}>
                <p className="font-bold text-base-100 mb-2">{day.name}</p>
                <ul className="flex flex-col gap-1.5">
                  {day.exercises.map((it, j) => (
                    <li key={j} className="text-sm text-base-400 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{it.exerciseId ? getExercise(it.exerciseId)?.name ?? it.exerciseId : it.newExercise!.name}</span>
                        {it.newExercise && (
                          <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full shrink-0">NUEVO</span>
                        )}
                      </span>
                      <span className="text-xs text-base-500 shrink-0">
                        {it.targetSets}×{it.repMin}-{it.repMax}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

            <p className="text-xs text-base-500 text-center">
              Esto crea una rutina nueva independiente — tus rutinas actuales no se tocan. Podrás activarla desde "Mis rutinas" cuando quieras.
            </p>
            <Button size="lg" className="w-full" onClick={save}>
              Guardar como nueva rutina
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setPreview(null)}>
              Volver a pegar
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
