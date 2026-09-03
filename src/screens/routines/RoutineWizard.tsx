import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { newId } from '../../lib/id'
import { todayIso } from '../../lib/format'
import { exercises, getExercise } from '../../data/exercises'
import { matchesExerciseQuery } from '../../lib/exerciseSearch'
import { equipmentLabels } from '../../lib/equipmentLabels'
import { fetchStarterRoutineBlueprints, instantiateStarterRoutine } from '../../data/starterRoutines'
import type { RoutineBlueprint, BlueprintItem, DayBlueprint } from '../../data/starterRoutines'
import { dayCatalog, CATEGORY_LABELS, CATEGORY_ORDER } from '../../data/dayCatalog'
import type { DayCategory } from '../../data/dayCatalog'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import type { Routine } from '../../types'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MIN_DAYS = 1

type AssemblyMode = 'template' | 'byDay' | null

export default function RoutineWizard() {
  const { routines, addRoutine, setActiveRoutineId, profile, updateProfile, addBodyMetric } = useAppStore()
  const navigate = useNavigate()
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set())
  const [blueprints, setBlueprints] = useState<RoutineBlueprint[] | null>(null)
  const [preview, setPreview] = useState<{ blueprint: RoutineBlueprint; dayCount?: number } | null>(null)
  const [profileDone, setProfileDone] = useState(!!profile.name.trim())
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    age: profile.age || '',
    heightCm: profile.heightCm || '',
    weightKg: profile.weightKg || '',
  })

  const [assemblyMode, setAssemblyMode] = useState<AssemblyMode>(null)
  const [dayPlan, setDayPlan] = useState<(DayBlueprint | null)[]>([])
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [pickingCategory, setPickingCategory] = useState<DayCategory | null>(null)
  const [customBuilder, setCustomBuilder] = useState<{ name: string; items: BlueprintItem[] } | null>(null)
  const [customQuery, setCustomQuery] = useState('')

  useEffect(() => {
    fetchStarterRoutineBlueprints().then(setBlueprints)
  }, [])

  const dayCount = selectedDays.size

  useEffect(() => {
    if (assemblyMode !== 'byDay') return
    setDayPlan((prev) => {
      const next = Array.from({ length: dayCount }, (_, i) => prev[i] ?? null)
      return next
    })
  }, [assemblyMode, dayCount])

  function saveProfileStep() {
    const weight = Number(profileForm.weightKg) || 0
    updateProfile({
      ...profile,
      name: profileForm.name.trim(),
      age: Number(profileForm.age) || 0,
      heightCm: Number(profileForm.heightCm) || 0,
      weightKg: weight,
    })
    if (weight > 0) addBodyMetric({ date: todayIso(), weight })
    setProfileDone(true)
  }

  function toggleDay(i: number) {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function isFlexible(b: RoutineBlueprint) {
    return b.minDays !== undefined && b.maxDays !== undefined
  }

  function isCompatible(b: RoutineBlueprint): boolean {
    if (isFlexible(b)) return dayCount >= b.minDays! && dayCount <= b.maxDays!
    return b.days.length === dayCount
  }

  const compatible = blueprints?.filter(isCompatible) ?? []
  const others = blueprints?.filter((b) => !isCompatible(b)) ?? []

  function openPreview(blueprint: RoutineBlueprint) {
    setPreview({ blueprint, dayCount: isFlexible(blueprint) ? dayCount : undefined })
  }

  function confirmPreview() {
    if (!preview) return
    const routine = instantiateStarterRoutine(preview.blueprint, preview.dayCount)
    addRoutine(routine)
    setActiveRoutineId(routine.id)
    navigate(`/routines/${routine.id}`)
  }

  function createFromScratch() {
    const now = new Date().toISOString()
    const routine: Routine = { id: newId('routine'), name: `Rutina ${routines.length + 1}`, days: [], createdAt: now, updatedAt: now }
    addRoutine(routine)
    setActiveRoutineId(routine.id)
    navigate(`/routines/${routine.id}`)
  }

  function assignSlot(day: DayBlueprint) {
    if (editingSlot === null) return
    setDayPlan((prev) => prev.map((d, i) => (i === editingSlot ? day : d)))
    setEditingSlot(null)
    setPickingCategory(null)
    setCustomBuilder(null)
  }

  function startCustomDay() {
    setCustomBuilder({ name: '', items: [] })
    setCustomQuery('')
  }

  function addCustomExercise(exerciseId: string) {
    if (!customBuilder) return
    const isTime = getExercise(exerciseId)?.logType === 'time'
    setCustomBuilder({
      ...customBuilder,
      items: [...customBuilder.items, { exerciseId, targetSets: 3, repMin: isTime ? 20 : 8, repMax: isTime ? 40 : 12 }],
    })
    setCustomQuery('')
  }

  function removeCustomExercise(index: number) {
    if (!customBuilder) return
    setCustomBuilder({ ...customBuilder, items: customBuilder.items.filter((_, i) => i !== index) })
  }

  function saveCustomDay() {
    if (!customBuilder || customBuilder.items.length === 0) return
    assignSlot({ name: customBuilder.name.trim() || `Día ${pickingCategory ? CATEGORY_LABELS[pickingCategory] : 'personalizado'}`, items: customBuilder.items })
  }

  const customSearchResults = useMemo(() => {
    if (!customBuilder) return []
    return exercises.filter((e) => (e.section === 'main' || e.section === 'abs') && matchesExerciseQuery(e, customQuery)).slice(0, 30)
  }, [customBuilder, customQuery])

  function confirmByDayPlan() {
    const days = dayPlan.filter((d): d is DayBlueprint => d !== null)
    if (days.length !== dayCount) return
    const syntheticBlueprint: RoutineBlueprint = { id: 'custom-by-day', name: `Rutina ${routines.length + 1}`, days }
    setPreview({ blueprint: syntheticBlueprint })
  }

  if (!profileDone) {
    return (
      <div className="pb-8">
        <PageHeader title="Cuéntanos sobre ti" subtitle="Así podemos calcular tu progreso" onBack />
        <div className="px-4 flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <Field label="Nombre">
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input"
                placeholder="Tu nombre"
              />
            </Field>
            <Field label="Edad">
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Altura (cm)">
              <input
                type="number"
                value={profileForm.heightCm}
                onChange={(e) => setProfileForm({ ...profileForm, heightCm: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Peso (kg)">
              <input
                type="number"
                value={profileForm.weightKg}
                onChange={(e) => setProfileForm({ ...profileForm, weightKg: e.target.value })}
                className="input"
              />
            </Field>
          </Card>
          <Button size="lg" className="w-full" onClick={saveProfileStep} disabled={!profileForm.name.trim()}>
            Continuar
          </Button>
        </div>
      </div>
    )
  }

  if (preview) {
    const previewDays = preview.dayCount ? preview.blueprint.days.slice(0, preview.dayCount) : preview.blueprint.days
    return (
      <div className="pb-8">
        <PageHeader title={preview.blueprint.name} subtitle="Revisa los días antes de guardarla" onBack={() => setPreview(null)} />
        <div className="px-4 flex flex-col gap-3">
          {previewDays.map((day, i) => (
            <Card key={i}>
              <p className="font-bold text-base-100 mb-2">{day.name}</p>
              <ul className="flex flex-col gap-1">
                {day.items.map((it, j) => {
                  const exercise = getExercise(it.exerciseId)
                  return (
                    <li key={j} className="text-sm text-base-400 flex items-center justify-between">
                      <span>{exercise?.name ?? it.exerciseId}</span>
                      <span className="text-xs text-base-500 shrink-0">
                        {it.targetSets}×{it.repMin}-{it.repMax}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
          <Button size="lg" className="w-full mt-1" onClick={confirmPreview}>
            Guardar rutina
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => setPreview(null)}>
            Elegir otra
          </Button>
        </div>
      </div>
    )
  }

  if (editingSlot !== null) {
    return (
      <div className="pb-8">
        <PageHeader
          title={`Día ${editingSlot + 1}`}
          subtitle={customBuilder ? 'Añade los ejercicios de este día' : '¿Qué tipo de día quieres?'}
          onBack={() => {
            if (customBuilder) {
              setCustomBuilder(null)
              return
            }
            setEditingSlot(null)
            setPickingCategory(null)
          }}
        />
        <div className="px-4 flex flex-col gap-4">
          {!customBuilder && (
            <>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ORDER.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPickingCategory(cat)}
                    className={`px-3 py-2 rounded-full text-xs font-semibold border ${
                      pickingCategory === cat ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {pickingCategory && (
                <div className="flex flex-col gap-2">
                  {dayCatalog
                    .filter((d) => d.category === pickingCategory)
                    .map((d) => (
                      <button key={d.id} onClick={() => assignSlot(d.blueprint)} className="text-left">
                        <Card className="active:bg-base-800">
                          <p className="font-semibold text-base-100">{d.blueprint.name}</p>
                          <p className="text-xs text-base-500 mt-0.5">{d.blueprint.items.map((it) => getExercise(it.exerciseId)?.name ?? it.exerciseId).join(' · ')}</p>
                        </Card>
                      </button>
                    ))}
                </div>
              )}

              <Button variant="secondary" size="lg" className="w-full" onClick={startCustomDay}>
                Crear este día desde cero
              </Button>
            </>
          )}

          {customBuilder && (
            <>
              <Field label="Nombre del día">
                <input
                  value={customBuilder.name}
                  onChange={(e) => setCustomBuilder({ ...customBuilder, name: e.target.value })}
                  placeholder={pickingCategory ? CATEGORY_LABELS[pickingCategory] : 'Mi día'}
                  className="input"
                />
              </Field>

              {customBuilder.items.length > 0 && (
                <div className="flex flex-col gap-2">
                  {customBuilder.items.map((it, i) => (
                    <Card key={i} className="p-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-base-100">{getExercise(it.exerciseId)?.name ?? it.exerciseId}</span>
                      <button onClick={() => removeCustomExercise(i)} className="text-xs text-accent-push shrink-0 ml-2">
                        Quitar
                      </button>
                    </Card>
                  ))}
                </div>
              )}

              <input
                autoFocus
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Buscar ejercicio por nombre o músculo..."
                className="input"
              />
              <div className="flex flex-col gap-2">
                {customSearchResults.map((ex) => (
                  <button key={ex.id} onClick={() => addCustomExercise(ex.id)} className="text-left">
                    <Card className="active:bg-base-800 p-3">
                      <p className="font-semibold text-base-100">{ex.name}</p>
                      <p className="text-xs text-base-500">
                        {ex.mainMuscles.join(', ')} · {equipmentLabels[ex.equipment]}
                      </p>
                    </Card>
                  </button>
                ))}
              </div>

              <Button size="lg" className="w-full" onClick={saveCustomDay} disabled={customBuilder.items.length === 0}>
                Guardar día
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <PageHeader title="Crear rutina" subtitle="Elige tus días y te sugerimos una rutina" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <p className="text-sm font-bold mb-1">¿Qué días quieres entrenar?</p>
          <p className="text-xs text-base-500 mb-3">Toca los días que te vengan bien, aunque sea solo uno.</p>
          <div className="flex justify-between gap-1.5">
            {WEEKDAYS.map((label, i) => {
              const selected = selectedDays.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-sm font-bold border ${
                    selected ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-400'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-base-500 mt-3 text-center">
            {dayCount === 0
              ? 'Todavía no has elegido ningún día'
              : `Entrenas ${dayCount} día${dayCount === 1 ? '' : 's'} a la semana`}
          </p>
        </Card>

        {dayCount >= MIN_DAYS && assemblyMode === null && (
          <div className="flex flex-col gap-2">
            <button onClick={() => setAssemblyMode('template')} className="text-left">
              <Card className="active:bg-base-800">
                <p className="font-semibold text-base-100">Usar una plantilla completa</p>
                <p className="text-xs text-base-500 mt-0.5">Push Pull Legs, Full Body, Torso/Pierna… ya montadas.</p>
              </Card>
            </button>
            <button onClick={() => setAssemblyMode('byDay')} className="text-left">
              <Card className="active:bg-base-800">
                <p className="font-semibold text-base-100">Elegir cada día por separado</p>
                <p className="text-xs text-base-500 mt-0.5">Mezcla Push A, Pull B, Full Body C... o crea un día desde cero.</p>
              </Card>
            </button>
          </div>
        )}

        {dayCount >= MIN_DAYS && assemblyMode === 'template' && (
          <>
            <button className="text-xs font-semibold text-brand text-left" onClick={() => setAssemblyMode(null)}>
              ‹ Cambiar cómo montarla
            </button>

            {!blueprints && <p className="text-sm text-base-500 text-center py-4">Cargando plantillas…</p>}

            {blueprints && compatible.length > 0 && (
              <div>
                <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Compatibles con {dayCount} días</p>
                <div className="flex flex-col gap-2">
                  {compatible.map((b) => (
                    <button key={b.id} onClick={() => openPreview(b)} className="text-left">
                      <Card className="active:bg-base-800">
                        <p className="font-semibold text-base-100">{b.name}</p>
                        <p className="text-xs text-base-500 mt-0.5">{b.days.slice(0, dayCount).map((d) => d.name).join(' · ')}</p>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {blueprints && compatible.length === 0 && (
              <Card className="text-center py-6">
                <p className="text-sm text-base-400">Ninguna plantilla encaja exactamente con {dayCount} días. Prueba otro número, o mira las de abajo.</p>
              </Card>
            )}

            {blueprints && others.length > 0 && (
              <div>
                <p className="text-xs text-base-500 mb-2 uppercase tracking-wide">Otras plantillas</p>
                <div className="flex flex-col gap-2">
                  {others.map((b) => (
                    <button key={b.id} onClick={() => openPreview(b)} className="text-left">
                      <Card className="active:bg-base-800">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-base-100">{b.name}</p>
                          <span className="text-xs text-base-500 tabular shrink-0">
                            {isFlexible(b) ? `${b.minDays}-${b.maxDays} días` : `${b.days.length} días`}
                          </span>
                        </div>
                        <p className="text-xs text-base-500 mt-0.5">{b.days.map((d) => d.name).join(' · ')}</p>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {dayCount >= MIN_DAYS && assemblyMode === 'byDay' && (
          <>
            <button className="text-xs font-semibold text-brand text-left" onClick={() => setAssemblyMode(null)}>
              ‹ Cambiar cómo montarla
            </button>
            <div className="flex flex-col gap-2">
              {dayPlan.map((day, i) => (
                <button key={i} onClick={() => setEditingSlot(i)} className="text-left">
                  <Card className="active:bg-base-800">
                    {day ? (
                      <>
                        <p className="font-semibold text-base-100">
                          Día {i + 1}: {day.name}
                        </p>
                        <p className="text-xs text-base-500 mt-0.5">{day.items.map((it) => getExercise(it.exerciseId)?.name ?? it.exerciseId).join(' · ')}</p>
                      </>
                    ) : (
                      <p className="font-semibold text-base-400">Día {i + 1}: toca para elegir</p>
                    )}
                  </Card>
                </button>
              ))}
            </div>
            <Button size="lg" className="w-full" onClick={confirmByDayPlan} disabled={dayPlan.some((d) => d === null)}>
              Continuar
            </Button>
          </>
        )}

        <Button variant="secondary" size="lg" className="w-full" onClick={createFromScratch}>
          Prefiero crear la mía desde cero
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-base-500">{label}</span>
      {children}
    </label>
  )
}
