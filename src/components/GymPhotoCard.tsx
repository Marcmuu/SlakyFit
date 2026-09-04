import { useEffect, useRef, useState } from 'react'
import { compressImageFile } from '../lib/imageCompress'
import { getGymPhoto, saveGymPhoto, deleteGymPhoto } from '../data/gymPhotos'
import Card from './Card'

export default function GymPhotoCard({ exerciseId }: { exerciseId: string }) {
  const [gymPhoto, setGymPhoto] = useState(() => getGymPhoto(exerciseId))
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setGymPhoto(getGymPhoto(exerciseId))
  }, [exerciseId])

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const dataUrl = await compressImageFile(file)
      saveGymPhoto(exerciseId, dataUrl)
      setGymPhoto(getGymPhoto(exerciseId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la foto.')
    } finally {
      setUploading(false)
    }
  }

  function removePhoto() {
    deleteGymPhoto(exerciseId)
    setGymPhoto(undefined)
  }

  return (
    <Card>
      <p className="text-sm font-bold mb-1">Cómo es en tu gimnasio</p>
      <p className="text-xs text-base-500 mb-3">
        Si la máquina de tu gym es distinta a la de las fotos, guarda tu propia foto para identificarla rápido.
      </p>
      {gymPhoto ? (
        <div className="flex flex-col gap-2">
          <img src={gymPhoto.dataUrl} alt="Foto de tu gimnasio" className="w-full rounded-xl border border-base-800 object-cover max-h-64" />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-10 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700"
            >
              Cambiar foto
            </button>
            <button
              onClick={removePhoto}
              className="flex-1 h-10 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-accent-push active:bg-base-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-11 rounded-xl bg-base-800 border border-base-700 text-sm font-semibold text-base-200 active:bg-base-700 disabled:opacity-50"
        >
          {uploading ? 'Guardando…' : '+ Añadir foto de tu gimnasio'}
        </button>
      )}
      {error && <p className="text-xs text-accent-push mt-2">{error}</p>}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelected} />
    </Card>
  )
}
