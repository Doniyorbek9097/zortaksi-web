/**
 * Chatda bir vaqtda faqat bitta voice play.
 * Yangi play boshlanganda oldingisini to'xtatadi.
 */
type StopFn = () => void

let activeId: string | null = null
let activeStop: StopFn | null = null

export function claimVoicePlay(messageId: string, stop: StopFn) {
  const id = String(messageId || '').trim()
  if (!id) return
  if (activeId && activeId !== id) {
    try {
      activeStop?.()
    } catch {
      /* */
    }
  }
  activeId = id
  activeStop = stop
}

export function releaseVoicePlay(messageId: string) {
  const id = String(messageId || '').trim()
  if (!id || activeId !== id) return
  activeId = null
  activeStop = null
}
