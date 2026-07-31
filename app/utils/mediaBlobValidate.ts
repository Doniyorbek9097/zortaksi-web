/** Media blob yaroqliligini tekshirish — buzilgan IDB/HTTP keshini rad etish */

const JSON_HTML = /^[\s{[<]/

export async function readBlobHead(blob: Blob, len = 16): Promise<Uint8Array> {
  if (!blob?.size) return new Uint8Array(0)
  return new Uint8Array(await blob.slice(0, Math.min(len, blob.size)).arrayBuffer())
}

export async function isValidPhotoBlob(blob: Blob): Promise<boolean> {
  if (!blob?.size || blob.size < 64) return false
  const head = await readBlobHead(blob, 12)
  if (!head.length) return false
  const textStart = String.fromCharCode(...head.slice(0, 4))
  if (JSON_HTML.test(textStart)) return false
  // JPEG
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return true
  // PNG
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return true
  // GIF
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return true
  // WebP (RIFF....WEBP)
  if (
    head[0] === 0x52 &&
    head[1] === 0x49 &&
    head[2] === 0x46 &&
    head[3] === 0x46 &&
    head.length >= 12 &&
    head[8] === 0x57 &&
    head[9] === 0x45 &&
    head[10] === 0x42 &&
    head[11] === 0x50
  ) {
    return true
  }
  return false
}

export async function isValidVoiceBlob(blob: Blob): Promise<boolean> {
  if (!blob?.size || blob.size < 32) return false
  const head = await readBlobHead(blob, 12)
  if (!head.length) return false
  if (head[0] === 0x7b || head[0] === 0x3c) return false
  // OggS
  if (head[0] === 0x4f && head[1] === 0x67 && head[2] === 0x67 && head[3] === 0x53) return true
  // MP4/M4A — ....ftyp
  if (head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70) return true
  // ID3
  if (head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) return true
  // MPEG audio frame sync
  if (head[0] === 0xff && (head[1]! & 0xe0) === 0xe0) return true
  return blob.type.startsWith('audio/') && blob.size > 200
}

export async function isValidMediaBlob(
  blob: Blob,
  kind: 'voice' | 'photo',
): Promise<boolean> {
  return kind === 'photo' ? isValidPhotoBlob(blob) : isValidVoiceBlob(blob)
}

/** blob: URL hali yaroqlimi (revoke bo'lmagan) */
export async function isBlobUrlAlive(url: string): Promise<boolean> {
  if (!url?.startsWith('blob:')) return !!url
  try {
    const res = await fetch(url)
    if (!res.ok) return false
    const b = await res.blob()
    return b.size > 0
  } catch {
    return false
  }
}
