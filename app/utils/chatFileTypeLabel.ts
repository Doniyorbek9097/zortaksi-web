/** Chatda ochilmaydigan fayllar uchun ko'rsatiladigan tur */

export function getChatFileTypeLabel(
  type?: string,
  mimeType?: string,
  text?: string,
): string {
  const t = String(type || '').toLowerCase()
  const mime = String(mimeType || '').toLowerCase()
  const name = String(text || '').trim()
  const ext = /\.([a-z0-9]{2,8})$/i.exec(name)?.[1]?.toLowerCase() || ''

  if (t === 'sticker') return 'Stiker'
  if (t === 'video') return 'Video fayl'

  if (
    mime.includes('android.package-archive') ||
    mime.includes('vnd.android') ||
    ext === 'apk'
  ) {
    return 'APK fayl'
  }
  if (mime.includes('pdf') || ext === 'pdf') return 'PDF fayl'
  if (
    mime.includes('wordprocessingml') ||
    mime.includes('msword') ||
    mime.includes('docx') ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    return 'Word fayl'
  }
  if (
    mime.includes('spreadsheetml') ||
    mime.includes('ms-excel') ||
    mime.includes('excel') ||
    ext === 'xlsx' ||
    ext === 'xls'
  ) {
    return 'Excel fayl'
  }
  if (
    mime.includes('presentationml') ||
    mime.includes('powerpoint') ||
    ext === 'pptx' ||
    ext === 'ppt'
  ) {
    return 'PowerPoint fayl'
  }
  if (mime.includes('zip') || ext === 'zip' || ext === 'rar' || ext === '7z') {
    return 'ZIP fayl'
  }
  if (mime.startsWith('video/') || ext === 'mp4' || ext === 'webm' || ext === 'mov') {
    return 'Video fayl'
  }
  if (mime.startsWith('audio/')) return 'Audio fayl'

  if (t === 'document') return 'Fayl'
  return 'Fayl'
}

export function getChatFileTypeIcon(
  type?: string,
  mimeType?: string,
  text?: string,
): string {
  const label = getChatFileTypeLabel(type, mimeType, text)

  if (label === 'Stiker') return 'fa-solid fa-face-smile'
  if (label === 'PDF fayl') return 'fa-solid fa-file-pdf'
  if (label === 'APK fayl') return 'fa-solid fa-mobile-screen-button'
  if (label === 'Word fayl') return 'fa-solid fa-file-word'
  if (label === 'Excel fayl') return 'fa-solid fa-file-excel'
  if (label === 'PowerPoint fayl') return 'fa-solid fa-file-powerpoint'
  if (label === 'Video fayl') return 'fa-solid fa-file-video'
  if (label === 'Audio fayl') return 'fa-solid fa-file-audio'
  if (label === 'ZIP fayl') return 'fa-solid fa-file-zipper'
  return 'fa-solid fa-file'
}

export function isChatFileBadgeType(type?: string): boolean {
  const t = String(type || '').toLowerCase()
  return t === 'sticker' || t === 'document' || t === 'video'
}
