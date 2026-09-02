import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ActionSheet from '../../components/ActionSheet'
import type { Routine } from '../../types'

export default function RoutinesScreen() {
  const { routines, addRoutine, deleteRoutine, activeRoutineId, setActiveRoutineId } = useAppStore()
  const navigate = useNavigate()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  useBodyScrollLock(confirmDeleteId !== null)

  function createRoutine() {
    const now = new Date().toISOString()
    const routine: Routine = {
      id: newId('routine'),
      name: `Rutina ${routines.length + 1}`,
      days: [],
      createdAt: now,
      updatedAt: now,
    }
    addRoutine(routine)
    navigate(`/routines/${routine.id}`)
  }

  function duplicateRoutine(routine: Routine) {
    const now = new Date().toISOString()
    const copy: Routine = {
      ...routine,
      id: newId('routine'),
      name: `${routine.name} (copia)`,
      createdAt: now,
      updatedAt: now,
      days: routine.days.map((d) => ({
        ...d,
        id: newId('day'),
        exercises: d.exercises.map((e) => ({ ...e, id: newId('slot') })),
      })),
    }
    addRoutine(copy)
  }

  const routineToDelete = routines.find((r) => r.id === confirmDeleteId)

  return (
    <div className="pb-8">
      <PageHeader title="Mis rutinas" onBack />
      <div className="px-4 flex flex-col gap-3">
        {routines.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-base-400">Todavía no tienes ninguna rutina.</p>
          </Card>
        )}

        {routines.map((routine) => {
          const isActive = routine.id === activeRoutineId
          return (
            <Card key={routine.id} className={isActive ? 'border-brand/50 bg-brand/5' : ''}>
              <button className="text-left w-full" onClick={() => navigate(`/routines/${routine.id}`)}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-base-100 flex-1">{routine.name}</p>
                  {isActive && (
                    <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full shrink-0">ACTIVA</span>
                  )}
                </div>
                <p className="text-xs text-base-500">
                  {routine.days.length} día{routine.days.length === 1 ? '' : 's'}
                </p>
                <div className="flex gap-1 mt-2">
                  {routine.days.map((d) => (
                    <span key={d.id} className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  ))}
                </div>
              </button>
              <div className="flex gap-4 mt-3 pt-3 border-t border-base-800 text-xs font-semibold">
                {!isActive && (
                  <button className="text-brand" onClick={() => setActiveRoutineId(routine.id)}>
                    Activar
                  </button>
                )}
                <button className="text-base-400" onClick={() => duplicateRoutine(routine)}>
                  Duplicar
                </button>
                <button className="text-accent-push" onClick={() => setConfirmDeleteId(routine.id)}>
                  Eliminar
                </button>
              </div>
            </Card>
          )
        })}

        <Button variant="secondary" size="lg" className="w-full mt-2" onClick={createRoutine}>
          + Crear rutina
        </Button>
      </div>

      {routineToDelete && (
        <ActionSheet onDismiss={() => setConfirmDeleteId(null)}>
          <p className="text-lg font-bold mb-1">¿Eliminar "{routineToDelete.name}"?</p>
          <p className="text-sm text-base-400 mb-5">
            Se borrará la rutina y sus días. Los entrenamientos que ya registraste con ella no se ven afectados.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                deleteRoutine(routineToDelete.id)
                setConfirmDeleteId(null)
              }}
            >
              Eliminar rutina
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
