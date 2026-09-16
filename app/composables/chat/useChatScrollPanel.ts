import type { Ref, ComputedRef } from 'vue'
import type { useChatStore } from '~/stores/chat.store'

type ChatStore = ReturnType<typeof useChatStore>

/**
 * Chat xabarlar ro'yxati scroll — pastga, fokus, eski xabarlar.
 */
export function useChatScrollPanel(opts: {
  chatStore: ChatStore
  chatId: ComputedRef<string>
  scrollEl: Ref<HTMLElement | null>
  focusId: Ref<string>
}) {
  const { chatStore, chatId, scrollEl, focusId } = opts

  let scrollLoadLock = false

  const formatTime = (value: string | Date) => {
    const d = new Date(value)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const scrollToBottom = () => {
    nextTick(() => {
      if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
    })
  }

  const scrollToFocus = () => {
    if (!focusId.value) {
      scrollToBottom()
      return
    }
    nextTick(() => {
      const el = document.getElementById(`msg-${focusId.value}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          focusId.value = ''
        }, 2500)
      } else {
        scrollToBottom()
      }
    })
  }

  /** Tepaga scroll — keyingi 10 ta eski xabar */
  const onMessagesScroll = async () => {
    const el = scrollEl.value
    const id = chatId.value
    if (!el || !id || id === 'open') return
    if (scrollLoadLock || chatStore.isLoadingOlderMessages || chatStore.isLoadingMessages) return
    if (!chatStore.hasMoreMessages) return
    if (el.scrollTop > 72) return

    scrollLoadLock = true
    const prevHeight = el.scrollHeight
    try {
      await chatStore.loadOlderMessages(id)
      await nextTick()
      el.scrollTop = el.scrollHeight - prevHeight
    } catch (err) {
      console.error('loadOlderMessages error:', err)
    } finally {
      scrollLoadLock = false
    }
  }

  const bindScrollListener = () => {
    watch(scrollEl, (el, _, onCleanup) => {
      if (!el) return
      el.addEventListener('scroll', onMessagesScroll, { passive: true })
      onCleanup(() => el.removeEventListener('scroll', onMessagesScroll))
    })

    watch(
      () => chatStore.messages.at(-1)?._id,
      (newId, oldId) => {
        if (newId && newId !== oldId) scrollToBottom()
      },
    )

    watch(() => chatStore.isPeerTyping, (v) => {
      if (v) scrollToBottom()
    })
  }

  const disposeScroll = () => {}

  return {
    formatTime,
    scrollToBottom,
    scrollToFocus,
    onMessagesScroll,
    bindScrollListener,
    disposeScroll,
  }
}
