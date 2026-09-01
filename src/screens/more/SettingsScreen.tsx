import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { STORAGE_KEYS } from '../../data/storage'

export default function SettingsScreen() {
  const navigate = useNavigate()

  function resetDemoData() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(`slakyfit:${key}`))
    window.location.reload()
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
