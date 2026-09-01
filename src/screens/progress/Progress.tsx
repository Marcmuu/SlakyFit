import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import BodyTab from './BodyTab'
import TrainingTab from './TrainingTab'
import ExercisesTab from './ExercisesTab'
import GoalsTab from './GoalsTab'

const TABS = [
  { id: 'body', label: 'Cuerpo' },
  { id: 'training', label: 'Entrenamiento' },
  { id: 'exercises', label: 'Ejercicios' },
  { id: 'goals', label: 'Objetivos' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Progress() {
  const [tab, setTab] = useState<TabId>('body')

  return (
    <div className="pb-8">
      <PageHeader title="Progreso" />
      <div className="px-4 flex gap-2 overflow-x-auto mb-4 -mt-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 h-9 px-4 rounded-full text-sm font-semibold border ${
              tab === t.id ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-4">
        {tab === 'body' && <BodyTab />}
        {tab === 'training' && <TrainingTab />}
        {tab === 'exercises' && <ExercisesTab />}
        {tab === 'goals' && <GoalsTab />}
      </div>
    </div>
  )
}
