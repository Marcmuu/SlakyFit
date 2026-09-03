import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import { todayIso } from '../../lib/format'
import { colorForDayIndex } from '../../lib/color'
import { SPORTS_CATALOG, CUSTOM_ACTIVITY_EMOJIS } from '../../lib/sportsCatalog'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Stepper from '../../components/Stepper'
import ActionSheet from '../../components/ActionSheet'
import type { Activity } from '../../types'

export default function ActivityEditor() {
  const { date: dateParam, activityId } = useParams()
  const { activities, addActivity, updateActivity, deleteActivity } = useAppStore()
  const navigate = useNavigate()

  const existing = activityId ? activities.find((a) => a.id === activityId) : undefined
  const isNew = !activityId

  const [activity, setActivity] = useState<Activity>(
    () =>
      existing ?? {
        id: newId('activity'),
        date: dateParam ?? todayIso(),
        name: '',
        emoji: '🏅',
        color: colorForDayIndex(0),
        durationMin: undefined,
        notes: undefined,
      },
  )
  const [customMode, setCustomMode] = useState(!existing || !SPORTS_CATALOG.some((s) => s.name === existing.name))
  const [confirmDelete, setConfirmDelete] = useState(false)
  useBodyScrollLock(confirmDelete)

  if (activityId && !existing) {
    return (
      <div>
        <PageHeader title="Actividad" onBack />
        <p className="px-4 text-base-400">No se encontró esta actividad.</p>
      </div>
    )
  }

  function save() {
    if (!activity.name.trim()) return
    if (isNew) addActivity(activity)
    else updateActivity(activity)
    navigate(`/calendar/${activity.date}`, { replace: true })
  }

  return (
    <div className="pb-8">
      <PageHeader title={isNew ? 'Añadir actividad' : 'Editar actividad'} onBack />
      <div className="px-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-base-500 mb-2">Fecha</p>
          <input
            type="date"
            value={activity.date}
            onChange={(e) => setActivity({ ...activity, date: e.target.value })}
            className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
          />
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2">Deporte</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {SPORTS_CATALOG.map((sport) => {
              const selected = !customMode && activity.name === sport.name
              return (
                <button
                  key={sport.id}
                  onClick={() => {
                    setCustomMode(false)
                    setActivity({ ...activity, name: sport.name, emoji: sport.emoji, color: sport.color })
                  }}
                  className="h-16 rounded-xl border flex flex-col items-center justify-center gap-1"
                  style={selected ? { background: sport.color, borderColor: sport.color } : { borderColor: '#262c34' }}
                >
                  <span className="text-xl">{sport.emoji}</span>
                  <span className={`text-[10px] font-semibold ${selected ? 'text-base-950' : 'text-base-400'}`}>{sport.name}</span>
                </button>
              )
            })}
            <button
              onClick={() => setCustomMode(true)}
              className="h-16 rounded-xl border flex flex-col items-center justify-center gap-1"
              style={customMode ? { background: activity.color, borderColor: activity.color } : { borderColor: '#262c34' }}
            >
              <span className="text-xl">{customMode ? activity.emoji : '➕'}</span>
              <span className={`text-[10px] font-semibold ${customMode ? 'text-base-950' : 'text-base-400'}`}>Otro</span>
            </button>
          </div>

          {customMode && (
            <Card className="flex flex-col gap-3">
              <input
                value={activity.name}
                onChange={(e) => setActivity({ ...activity, name: e.target.value })}
                placeholder="Nombre del deporte o actividad"
                className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
              />
              <div>
                <p className="text-xs text-base-500 mb-2">Icono</p>
                <div className="flex gap-2 flex-wrap">
                  {CUSTOM_ACTIVITY_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setActivity({ ...activity, emoji })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${
                        activity.emoji === emoji ? 'border-brand bg-brand/10' : 'border-base-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-base-500 mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 8 }, (_, i) => colorForDayIndex(i)).map((c) => (
                    <button
                      key={c}
                      onClick={() => setActivity({ ...activity, color: c })}
                      className={`w-8 h-8 rounded-full border-2 ${activity.color === c ? 'border-base-100' : 'border-transparent'}`}
                      style={{ background: c }}
                      aria-label="Elegir color"
                    />
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2">Duración (min, opcional)</p>
          <Stepper
            value={activity.durationMin ?? 0}
            onChange={(v) => setActivity({ ...activity, durationMin: v || undefined })}
            step={5}
            min={0}
            max={300}
            suffix="min"
            label="Duración"
          />
        </div>

        <div>
          <p className="text-xs text-base-500 mb-2">Notas</p>
          <textarea
            value={activity.notes ?? ''}
            onChange={(e) => setActivity({ ...activity, notes: e.target.value || undefined })}
            placeholder="Notas (opcional)"
            className="w-full bg-base-800 border border-base-700 rounded-xl p-3 text-sm text-base-100 resize-none"
            rows={2}
          />
        </div>

        <Button size="lg" className="w-full" disabled={!activity.name.trim()} onClick={save}>
          Guardar
        </Button>

        {!isNew && (
          <button onClick={() => setConfirmDelete(true)} className="text-sm text-accent-push text-center">
            Eliminar actividad
          </button>
        )}
      </div>

      {confirmDelete && (
        <ActionSheet onDismiss={() => setConfirmDelete(false)}>
          <p className="text-lg font-bold mb-1">¿Eliminar esta actividad?</p>
          <p className="text-sm text-base-400 mb-5">No se puede deshacer.</p>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                deleteActivity(activity.id)
                navigate(`/calendar/${activity.date}`, { replace: true })
              }}
            >
              Eliminar
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
