import { useRef, useState } from 'react'
import { addCustomExercise } from '../data/customExercises'
import { saveGymPhoto } from '../data/gymPhotos'
import { compressImageFile } from '../lib/imageCompress'
import { equipmentLabels } from '../lib/equipmentLabels'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import Button from './Button'
import type { Muscle, Equipment, ExerciseSection, ExerciseLogType } from '../types'

const MUSCLES: Muscle[] = ['pecho', 'espalda', 'hombro', 'biceps', 'triceps', 'cuadriceps', 'isquios', 'gluteo', 'gemelos', 'core', 'antebrazo']
const EQUIPMENT_OPTIONS: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'smith', 'plate', 'bodyweight']
const SECTION_LABELS: Record<ExerciseSection, string> = { main: 'Principal', abs: 'Abs', mobility: 'Movilidad', flexibility: 'Flexibilidad' }
const LOGTYPE_LABELS: Record<ExerciseLogType, string> = {
  'weight-reps': 'Peso y repeticiones',
  'bodyweight-reps': 'Peso corporal (+ lastre opcional)',
  time: 'Tiempo (mantener)',
}

export default function CreateExerciseSheet({ onCreated, onClose }: { onCreated: (exerciseId: string) => void; onClose: () => void }) {
  useBodyScrollLock(true)
  const [name, setName] = useState('')
  const [section, setSection] = useState<ExerciseSection>('main')
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [equipment, setEquipment] = useState<Equipment>('machine')
  const [logType, setLogType] = useState<ExerciseLogType>('weight-reps')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleMuscle(m: Muscle) {
    setMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError(null)
    try {
      setPhotoDataUrl(await compressImageFile(file))
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'No se pudo procesar la foto.')
    }
  }

  function save() {
    const exercise = addCustomExercise({ name, section, mainMuscles: muscles, equipment, logType })
    if (photoDataUrl) saveGymPhoto(exercise.id, photoDataUrl)
    onCreated(exercise.id)
  }

  const canSave = name.trim().length > 0 && muscles.length > 0

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[88vh] bg-base-900 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto safe-bottom">
        <p className="text-lg font-bold mb-1">Crear ejercicio</p>
        <p className="text-sm text-base-400 mb-4">Para cuando no encuentras el tuyo en la biblioteca.</p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-base-500 mb-2">Nombre</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Press hombro en máquina Hoist"
              className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
            />
          </div>

          <div>
            <p className="text-xs text-base-500 mb-2">Sección</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SECTION_LABELS) as ExerciseSection[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    section === s ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
                  }`}
                >
                  {SECTION_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-base-500 mb-2">Músculos principales</p>
            <div className="flex flex-wrap gap-2">
              {MUSCLES.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${
                    muscles.includes(m) ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-base-500 mb-2">Equipo</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setEquipment(eq)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    equipment === eq ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
                  }`}
                >
                  {equipmentLabels[eq]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-base-500 mb-2">Cómo se registra</p>
            <div className="flex flex-col gap-2">
              {(Object.keys(LOGTYPE_LABELS) as ExerciseLogType[]).map((lt) => (
                <button
                  key={lt}
                  onClick={() => setLogType(lt)}
                  className={`h-10 rounded-xl text-sm font-semibold border text-left px-3 ${
                    logType === lt ? 'bg-brand text-base-950 border-brand' : 'border-base-700 text-base-300'
                  }`}
                >
                  {LOGTYPE_LABELS[lt]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-base-500 mb-2">Foto (opcional)</p>
            {photoDataUrl ? (
              <div className="flex flex-col gap-2">
                <img src={photoDataUrl} alt="Foto del ejercicio" className="w-full rounded-xl border border-base-800 object-cover max-h-48" />
                <button
                  onClick={() => setPhotoDataUrl(null)}
                  className="h-10 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-accent-push"
                >
                  Quitar foto
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-11 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700"
              >
                + Añadir foto
              </button>
            )}
            {photoError && <p className="text-xs text-accent-push mt-2">{photoError}</p>}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-5">
          <Button size="lg" onClick={save} disabled={!canSave}>
            Crear ejercicio
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
