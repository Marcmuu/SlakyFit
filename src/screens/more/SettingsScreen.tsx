import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { STORAGE_KEYS, exportAllData, importAllData } from '../../data/storage'

export default function SettingsScreen() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function resetDemoData() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(`slakyfit:${key}`))
    window.location.reload()
  }

  function exportData() {
    const backup = exportAllData()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `slakyfit-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importData(file: File) {
    setImportError(null)
    try {
      const payload = JSON.parse(await file.text())
      importAllData(payload)
      window.location.reload()
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'No se pudo leer el archivo.')
    }
  }

  return (
    <div>
      <PageHeader title="Configuración" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <p className="text-sm font-bold mb-1">SlakyFit</p>
          <p className="text-sm text-base-500">Prototipo V1 · Los datos se guardan solo en este dispositivo.</p>
        </Card>
        <Card>
          <p className="text-sm font-bold mb-2">Copia de seguridad</p>
          <p className="text-xs text-base-500 mb-3">
            Exporta tu historial a un archivo para guardarlo o pasarlo a otro dispositivo. Importar sobrescribe los
            datos actuales de este navegador.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportData}>
              Exportar datos
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Importar datos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) importData(file)
              }}
            />
          </div>
          {importError && <p className="text-xs text-accent-push mt-2">{importError}</p>}
        </Card>
        <Card>
          <p className="text-sm font-bold mb-2">Restablecer datos de demostración</p>
          <p className="text-xs text-base-500 mb-3">Borra todo el historial local y vuelve a generar los datos de ejemplo.</p>
          <Button variant="danger" onClick={resetDemoData}>
            Restablecer datos
          </Button>
        </Card>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
