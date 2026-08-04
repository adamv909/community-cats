import Dexie, { type EntityTable } from 'dexie'

// New-cat photos are compressed JPEG data URLs (~100-300KB each). Keeping them in the
// Zustand `feeding-round` store means every one gets written to localStorage on every
// state change and counts against the ~5MB origin quota shared with everything else on
// the page. IndexedDB has no such practical size limit, so photos live here — the
// feeding-round store only holds a `photoKey` reference into this table.
interface StoredPhoto {
  key: string
  dataUrl: string
  createdAt: string
}

const db = new Dexie('community-cats-photos') as Dexie & {
  photos: EntityTable<StoredPhoto, 'key'>
}

db.version(1).stores({
  photos: '&key, createdAt',
})

export async function savePhoto(dataUrl: string): Promise<string> {
  const key = crypto.randomUUID()
  await db.photos.put({ key, dataUrl, createdAt: new Date().toISOString() })
  return key
}

export async function getPhoto(key: string): Promise<string | undefined> {
  return (await db.photos.get(key))?.dataUrl
}

export async function getPhotos(keys: string[]): Promise<Record<string, string>> {
  if (keys.length === 0) return {}
  const rows = await db.photos.bulkGet(keys)
  const result: Record<string, string> = {}
  keys.forEach((key, i) => {
    const row = rows[i]
    if (row) result[key] = row.dataUrl
  })
  return result
}

export async function deletePhoto(key: string): Promise<void> {
  await db.photos.delete(key)
}

export async function deletePhotos(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await db.photos.bulkDelete(keys)
}
