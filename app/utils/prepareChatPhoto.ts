/** Chat rasmlari: katta fayllarni qayta o'lchamlash/siqish (yuborish va ko'rish uchun). */
const MAX_EDGE = 1920
const TARGET_MAX_BYTES = 2.5 * 1024 * 1024
const SKIP_COMPRESS_BELOW = 800 * 1024
const PREPARE_TIMEOUT_MS = 30_000

export const CHAT_PHOTO_MAX_INPUT = 20 * 1024 * 1024
/** Backend multipart limiti bilan mos (siqishdan keyin ham cheklov). */
export const CHAT_PHOTO_MAX_UPLOAD = 12 * 1024 * 1024

const IMAGE_NAME_RE = /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i

export function isChatPhotoFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return IMAGE_NAME_RE.test(file.name || '')
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Rasm ochilmadi'))
    }
    img.src = url
  })
}

type DecodedImage = {
  width: number
  height: number
  paint: (ctx: CanvasRenderingContext2D) => void
  cleanup: () => void
}

/** Katta rasmlarni to'liq dekod qilmasdan createImageBitmap bilan o'lchamlaydi. */
async function decodeImageForCanvas(file: File, maxEdge: number): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, {
        resizeWidth: maxEdge,
        resizeHeight: maxEdge,
        resizeQuality: 'high',
        imageOrientation: 'from-image',
      } as ImageBitmapOptions)
      const w = bitmap.width
      const h = bitmap.height
      return {
        width: w,
        height: h,
        paint: (ctx) => ctx.drawImage(bitmap, 0, 0, w, h),
        cleanup: () => bitmap.close(),
      }
    } catch {
      /* Image fallback */
    }
  }

  const img = await loadImage(file)
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight, 1))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  return {
    width: w,
    height: h,
    paint: (ctx) => ctx.drawImage(img, 0, 0, w, h),
    cleanup: () => {},
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

function fileFromBlob(blob: Blob, file: File): File {
  const base = (file.name || 'photo').replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}

/**
 * Katta rasmlarni JPEG ga siqadi (GIF animatsiya saqlanadi).
 * Xatolik bo'lsa — kichik fayllar asl holida, katta fayllar xato.
 */
export async function prepareChatPhoto(file: File): Promise<File> {
  if (!import.meta.client) return file
  if (!isChatPhotoFile(file)) throw new Error('Faqat rasm yuborish mumkin')
  if (file.size > CHAT_PHOTO_MAX_INPUT) {
    throw new Error('Rasm 20 MB dan katta bo\'lmasligi kerak')
  }
  if (file.type === 'image/gif') return file

  const mustCompress = file.size > SKIP_COMPRESS_BELOW

  if (!mustCompress) {
    try {
      const decoded = await withTimeout(
        decodeImageForCanvas(file, MAX_EDGE),
        PREPARE_TIMEOUT_MS,
        'Rasm tayyorlash vaqti tugadi',
      )
      const fits = decoded.width <= MAX_EDGE && decoded.height <= MAX_EDGE
      decoded.cleanup()
      if (fits) return file
    } catch {
      if (!mustCompress) return file
    }
  }

  let decoded: DecodedImage | null = null
  try {
    decoded = await withTimeout(
      decodeImageForCanvas(file, MAX_EDGE),
      PREPARE_TIMEOUT_MS,
      'Rasm tayyorlash vaqti tugadi',
    )

    const canvas = document.createElement('canvas')
    canvas.width = decoded.width
    canvas.height = decoded.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      if (mustCompress) throw new Error('Rasmni qayta ishlash mumkin emas')
      return file
    }

    decoded.paint(ctx)

    let quality = 0.84
    let blob: Blob | null = null
    for (let i = 0; i < 6; i++) {
      blob = await canvasToBlob(canvas, 'image/jpeg', quality)
      if (!blob) break
      if (blob.size <= TARGET_MAX_BYTES) break
      quality = Math.max(0.45, quality - 0.1)
    }

    if (!blob) {
      if (mustCompress) throw new Error('Rasmni siqib bo\'lmadi')
      return file
    }

    if (blob.size >= file.size && !mustCompress) return file

    if (blob.size > CHAT_PHOTO_MAX_UPLOAD) {
      throw new Error('Rasm juda katta — boshqa rasm tanlang')
    }

    return fileFromBlob(blob, file)
  } catch (err: any) {
    if (mustCompress) {
      throw err instanceof Error ? err : new Error('Rasmni tayyorlab bo\'lmadi')
    }
    return file
  } finally {
    decoded?.cleanup()
  }
}
