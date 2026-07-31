/**
 * Chat media (voice/photo) — qurilmada IndexedDB kesh.
 * Serverga saqlanmaydi; birinchi yuklashdan keyin tez ijro.
 */

const DB_NAME = 'zortaksi-media'
const DB_VERSION = 2
const STORE = 'blobs'

type MediaRecord = {
  id: string
  blob: Blob
  kind: 'voice' | 'photo'
  updatedAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB yo\'q'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error || new Error('IDB open xato'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (event) => {
      const db = req.result
      const oldVersion = event.oldVersion
      if (oldVersion > 0 && db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE)
      }
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('IDB request xato'))
  })
}

/** Keshdan blob olish */
export async function idbGetMedia(messageId: string): Promise<Blob | null> {
  const id = String(messageId || '').trim()
  if (!id) return null
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readonly')
    const row = await idbReq<MediaRecord | undefined>(tx.objectStore(STORE).get(id))
    db.close()
    return row?.blob || null
  } catch {
    return null
  }
}

/** Keshga yozish */
export async function idbPutMedia(
  messageId: string,
  blob: Blob,
  kind: 'voice' | 'photo',
): Promise<void> {
  const id = String(messageId || '').trim()
  if (!id || !blob?.size) return
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readwrite')
    await idbReq(
      tx.objectStore(STORE).put({
        id,
        blob,
        kind,
        updatedAt: Date.now(),
      } satisfies MediaRecord),
    )
    db.close()
  } catch (err) {
    console.warn('[MediaIDB] put xato:', err)
  }
}

/** Bitta yozuvni o'chirish */
export async function idbDeleteMedia(messageId: string): Promise<void> {
  const id = String(messageId || '').trim()
  if (!id) return
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readwrite')
    await idbReq(tx.objectStore(STORE).delete(id))
    db.close()
  } catch {
    /* */
  }
}

/** Barcha media keshini tozalash */
export async function idbClearMedia(): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readwrite')
    await idbReq(tx.objectStore(STORE).clear())
    db.close()
  } catch (err) {
    console.warn('[MediaIDB] clear xato:', err)
    throw err
  }
}

/** Barcha yozuvlar — migratsiya / buzilgan blob tozalash */
export async function idbListAllMedia(): Promise<MediaRecord[]> {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readonly')
    const all = await idbReq<MediaRecord[]>(tx.objectStore(STORE).getAll())
    db.close()
    return all || []
  } catch {
    return []
  }
}

/** Yaroqsiz bloblarni o'chirish (brauzer keshini qo'lda tozalamasdan) */
export async function idbPurgeInvalid(
  isValid: (blob: Blob, kind: 'voice' | 'photo') => Promise<boolean>,
): Promise<number> {
  const rows = await idbListAllMedia()
  let removed = 0
  for (const row of rows) {
    if (!row?.id || !row.blob?.size) {
      await idbDeleteMedia(row?.id || '')
      removed++
      continue
    }
    const kind = row.kind === 'voice' ? 'voice' : 'photo'
    if (!(await isValid(row.blob, kind))) {
      await idbDeleteMedia(row.id)
      removed++
    }
  }
  return removed
}

/** Taxminiy kesh hajmi (bayt) */
export async function idbMediaStats(): Promise<{ count: number; bytes: number }> {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readonly')
    const all = await idbReq<MediaRecord[]>(tx.objectStore(STORE).getAll())
    db.close()
    let bytes = 0
    for (const row of all || []) bytes += row.blob?.size || 0
    return { count: all?.length || 0, bytes }
  } catch {
    return { count: 0, bytes: 0 }
  }
}
