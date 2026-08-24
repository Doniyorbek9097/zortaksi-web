/** Media blob yaroqliligini tekshirish */

export async function readBlobHead(blob: Blob, len = 16): Promise<Uint8Array> {
  if (!blob?.size) return new Uint8Array(0)
  return new Uint8Array(await blob.slice(0, Math.min(len, blob.size)).arrayBuffer())
}

/** Aniq buzilgan (JSON/HTML/bo'sh) — network va IDB uchun */
export async function isCorruptMediaBlob(
  blob: Blob,
  kind: 'voice' | 'photo' | 'document',
): Promise<boolean> {
  if (!blob?.size) return true
  if (kind === 'photo' && blob.size < 32) return true
  if (kind === 'voice' && blob.size < 16) return true
  if (kind === 'document' && blob.size < 8) return true

  const head = await readBlobHead(blob, 12)
  if (!head.length) return true

  if (head[0] === 0x7b || head[0] === 0x3c) return true

  try {
    const sample = new TextDecoder().decode(head.slice(0, 12)).trimStart()
    if (sample.startsWith('{') || sample.startsWith('<')) return true
    if (/"(success|message)"\s*:/i.test(sample)) return true
  } catch {
    /* */
  }

  return false
}

/** IDB dan o'qishda qo'shimcha tekshiruv (magic bytes) */
export async function isValidMediaBlob(
  blob: Blob,
  kind: 'voice' | 'photo' | 'document',
): Promise<boolean> {
  if (await isCorruptMediaBlob(blob, kind)) return false

  const head = await readBlobHead(blob, 12)
  if (!head.length) return false

  if (kind === 'document') {
    if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return true
    if (head[0] === 0x50 && head[1] === 0x4b) return true
    if (head[0] === 0x1a && head[1] === 0x45) return true
    return blob.size > 32
  }

  if (kind === 'photo') {
    if (head[0] === 0xff && head[1] === 0xd8) return true
    if (head[0] === 0x89 && head[1] === 0x50) return true
    if (head[0] === 0x47 && head[1] === 0x49) return true
    if (head[0] === 0x52 && head[1] === 0x49) return true
    return blob.type.startsWith('image/') && blob.size > 64
  }

  if (head[0] === 0x4f && head[1] === 0x67) return true
  if (head[4] === 0x66 && head[5] === 0x74) return true
  if (head[0] === 0x49 && head[1] === 0x44) return true
  if (head[0] === 0xff && (head[1]! & 0xe0) === 0xe0) return true
  return blob.type.startsWith('audio/') && blob.size > 32
}
