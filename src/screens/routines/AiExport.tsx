import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { buildAiExportText, buildAiExportSummary } from '../../data/aiExchange'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function AiExport() {
  const { profile, routines, sessions, goals } = useAppStore()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  const text = useMemo(() => buildAiExportText({ profile, routines, sessions, goals }), [profile, routines, sessions, goals])
  const summary = useMemo(() => buildAiExportSummary(routines, sessions), [routines, sessions])

  async function copyAll() {
    setCopyError(null)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError('No se pudo copiar automáticamente. Usa "Descargar archivo" y adjúntalo en su lugar.')
    }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `slakyfit-analisis-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pb-8">
      <PageHeader title="Analizar con IA" subtitle="Exporta tus datos para pegarlos en ChatGPT o Claude" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <p className="text-sm font-bold mb-2">Qué se incluye</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold tabular text-base-100">{summary.routineCount}</p>
              <p className="text-[10px] text-base-500 uppercase">Rutinas</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular text-base-100">{summary.sessionCount}</p>
              <p className="text-[10px] text-base-500 uppercase">Entrenos</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular text-base-100">{summary.exerciseCount}</p>
              <p className="text-[10px] text-base-500 uppercase">Ejercicios</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold mb-2">Cómo funciona</p>
          <ol className="text-sm text-base-300 flex flex-col gap-2 list-decimal list-inside">
            <li>Copia todo (ya lleva el prompt y tus datos, no hace falta escribir nada).</li>
            <li>Pégalo en ChatGPT, Claude o Gemini.</li>
            <li>Copia la respuesta completa de la IA (análisis + el bloque de código al final).</li>
            <li>Vuelve aquí y pulsa "Importar la respuesta".</li>
          </ol>
        </Card>

        <Button size="lg" className="w-full" onClick={copyAll}>
          {copied ? 'Copiado ✓' : 'Copiar todo'}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={download}>
          Descargar como archivo de texto
        </Button>
        {copyError && <p className="text-xs text-accent-push text-center">{copyError}</p>}

        <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('/routines/ai-import')}>
          Ya tengo la respuesta de la IA → Importar
        </Button>
      </div>
    </div>
  )
}
