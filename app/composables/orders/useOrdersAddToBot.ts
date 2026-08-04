import type { IOrder } from '~/types'
import type { BotGroupRow } from '~/stores/bot-group.store'
import { useBotGroupStore } from '~/stores/bot-group.store'

/**
 * Admin: buyurtma manba guruhini bot hudud kalit so'zlariga qo'shish.
 */
export function useOrdersAddToBot(options: {
  showError: (msg: string) => void
  showSuccess?: (msg: string) => void
}) {
  const botGroupStore = useBotGroupStore()

  const showAddToBotDialog = ref(false)
  const addToBotTarget = ref<IOrder | null>(null)
  const addToBotLoading = ref(false)
  const addToBotSaving = ref(false)

  const sourceGroupUsername = computed(() => {
    const raw = String(addToBotTarget.value?.group?.username || '')
      .trim()
      .replace(/^@/, '')
    return raw
  })

  const addToBotMessage = computed(() => {
    const u = sourceGroupUsername.value
    const title = String(addToBotTarget.value?.group?.title || '').trim()
    if (!u) {
      return 'Bu buyurtmada guruh username yo\'q — kalit so\'z qo\'shib bo\'lmaydi.'
    }
    if (title) {
      return `«${title}» (@${u}) bot guruhining hudud kalit so'zlariga qo'shiladi.`
    }
    return `@${u} bot guruhining hudud kalit so'zlariga qo'shiladi.`
  })

  const botGroups = computed(() => botGroupStore.groups)

  const onAddToBot = async (order: IOrder) => {
    if (!order._id) return
    addToBotTarget.value = order
    showAddToBotDialog.value = true
    addToBotLoading.value = true
    try {
      if (!botGroupStore.groups.length) {
        await botGroupStore.fetchGroups()
      }
    } catch (err: any) {
      showAddToBotDialog.value = false
      options.showError(err?.response?.data?.message || 'Bot guruhlar ro\'yxati yuklanmadi')
    } finally {
      addToBotLoading.value = false
    }
  }

  const cancelAddToBot = () => {
    showAddToBotDialog.value = false
    addToBotTarget.value = null
  }

  const selectBotGroup = async (bot: BotGroupRow) => {
    const keyword = sourceGroupUsername.value
    if (!keyword) {
      options.showError('Guruh username topilmadi')
      return
    }
    if (addToBotSaving.value) return

    addToBotSaving.value = true
    try {
      const res = await botGroupStore.appendKeyword(bot.id, keyword)
      const already = !!res?.data?.alreadyExists
      const label = bot.title ? `@${bot.username} (${bot.title})` : `@${bot.username}`
      const msg = already
        ? `@${keyword} allaqachon «${label}» kalit so'zlarida bor`
        : `@${keyword} «${label}» hudud kalit so'zlariga qo'shildi`
      if (options.showSuccess) options.showSuccess(msg)
      else options.showError(msg)
      showAddToBotDialog.value = false
      addToBotTarget.value = null
    } catch (err: any) {
      options.showError(err?.response?.data?.message || 'Kalit so\'z qo\'shilmadi')
    } finally {
      addToBotSaving.value = false
    }
  }

  return {
    showAddToBotDialog,
    addToBotTarget,
    addToBotLoading,
    addToBotSaving,
    addToBotMessage,
    sourceGroupUsername,
    botGroups,
    onAddToBot,
    cancelAddToBot,
    selectBotGroup,
  }
}
