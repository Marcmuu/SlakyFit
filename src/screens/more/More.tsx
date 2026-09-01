import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

const items = [
  { to: '/more/section/abs', label: 'ABS', desc: 'Rutinas y ejercicios de core' },
  { to: '/more/section/mobility', label: 'Movilidad', desc: 'Antes de entrenar' },
  { to: '/more/section/flexibility', label: 'Flexibilidad', desc: 'Estiramientos por zona' },
  { to: '/more/programs', label: 'Programas', desc: 'Vuelta al gimnasio V1' },
  { to: '/more/profile', label: 'Perfil', desc: 'Tus datos personales' },
  { to: '/more/settings', label: 'Configuración', desc: 'Preferencias de la app' },
]

export default function More() {
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader title="Más" />
      <div className="px-4 flex flex-col gap-2">
        {items.map((item) => (
          <button key={item.to} onClick={() => navigate(item.to)} className="text-left">
            <Card className="active:bg-base-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-base-100">{item.label}</p>
                <p className="text-xs text-base-500">{item.desc}</p>
              </div>
              <span className="text-base-600">›</span>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
