import { loadItem, saveItem, STORAGE_KEYS } from './storage'

export interface GymPhoto {
  dataUrl: string
  updatedAt: string
}

type GymPhotoMap = Record<string, GymPhoto>

function loadAll(): GymPhotoMap {
  return loadItem(STORAGE_KEYS.gymPhotos, {})
}

export function getGymPhoto(exerciseId: string): GymPhoto | undefined {
  return loadAll()[exerciseId]
}

export function saveGymPhoto(exerciseId: string, dataUrl: string): void {
  const all = loadAll()
  all[exerciseId] = { dataUrl, updatedAt: new Date().toISOString() }
  saveItem(STORAGE_KEYS.gymPhotos, all)
}

export function deleteGymPhoto(exerciseId: string): void {
  const all = loadAll()
  delete all[exerciseId]
  saveItem(STORAGE_KEYS.gymPhotos, all)
}
