<template>
  <div
    class="fixed inset-0 z-40 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950"
    :style="{ paddingTop: 'var(--zt-safe-top, 0px)' }"
  >
    <header
      class="shrink-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/70 dark:border-slate-800"
    >
      <div class="mx-auto w-full max-w-2xl px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
          aria-label="Orqaga"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <div class="flex -space-x-2 shrink-0">
          <ProfileAvatar :name="driverName" :src="driverAvatar" :user-id="driverId" size="sm" />
          <ProfileAvatar :name="customerName" :src="customerAvatar" :user-id="customerId" size="sm" />
        </div>

        <div class="flex-1 min-w-0 leading-none">
          <p class="text-[13px] font-black truncate text-slate-900 dark:text-white">
            Suhbat ko'rinishi
          </p>
          <p class="text-[10px] font-medium truncate mt-0.5 text-amber-600 dark:text-amber-400">
            Faqat ko'rish · yozib bo'lmaydi
          </p>
        </div>
      </div>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div class="mx-auto w-full max-w-2xl px-3 py-4 space-y-4 min-h-full flex flex-col">
        <div
          v-if="orderText"
          class="rounded-2xl px-3.5 py-3 border bg-amber-50 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-800/50"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.16em] mb-1.5 text-amber-600 dark:text-amber-400">
            Buyurtma
          </p>
          <p class="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
            {{ orderText }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/25"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Haydovchi
          </span>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-400/25"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Yo'lovchi
          </span>
        </div>

        <div v-if="loading" class="space-y-4 pt-2">
          <div v-for="n in 5" :key="n" class="flex gap-2.5">
            <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div class="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>

        <BaseEmptyState
          v-else-if="error"
          icon="fa-solid fa-triangle-exclamation"
          :title="error"
          class="!min-h-0 flex-1"
        />

        <BaseEmptyState
          v-else-if="!messages.length"
          icon="fa-solid fa-comments"
          title="Bu juftlikda xabar topilmadi"
          class="!min-h-0 flex-1"
        />

        <article
          v-for="msg in messages"
          :key="msg._id"
          class="flex gap-2.5 items-start"
        >
          <ProfileAvatar
            :name="speakerOf(msg).name"
            :src="speakerOf(msg).avatar"
            :user-id="speakerOf(msg).userId"
            size="sm"
            class="shrink-0 mt-0.5"
          />

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 mb-1.5 min-w-0 flex-wrap">
              <p class="text-[13px] font-black text-slate-900 dark:text-white truncate max-w-[50%]">
                {{ speakerOf(msg).name }}
              </p>
              <span
                class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide"
                :class="isDriverMsg(msg)
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  : 'bg-violet-500/15 text-violet-600 dark:text-violet-400'"
              >
                {{ isDriverMsg(msg) ? 'Haydovchi' : "Yo'lovchi" }}
              </span>
              <span class="shrink-0 text-[10px] font-medium text-slate-400 tabular-nums">
                {{ formatTime(msg.date) }}
              </span>
            </div>

            <!-- Ovoz / rasm / joylashuv -->
            <div
              v-if="isMediaMsg(msg)"
              class="[&_.max-w-\[82\%\]]:!max-w-full"
            >
              <ChatMessageBubble
                :text="msg.text"
                :text-format="msg.textFormat"
                :time="formatTime(msg.date)"
                :date="msg.date"
                :out="isDriverMsg(msg)"
                :read="msg.status === 'read'"
                :status="msg.status"
                :error="msg.error"
                :type="mediaTypeOf(msg)"
                :message-id="msgId(msg)"
                :media-path="msg.mediaPath"
                :mime-type="msg.mimeType"
                :duration="msg.duration"
                :location-lat="msg.locationLat"
                :location-lng="msg.locationLng"
                :location-title="msg.locationTitle"
                mask-phones
              />
            </div>

            <!-- Oddiy matn -->
            <div
              v-else
              class="rounded-2xl rounded-tl-md px-3.5 py-2.5 border text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words"
              :class="isDriverMsg(msg)
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-800/50'
                : 'bg-violet-50 dark:bg-violet-950/30 border-violet-200/70 dark:border-violet-800/40'"
            >
              <ChatLinkifiedText :text="msg.text || ''" mask-phones />
            </div>
          </div>
        </article>
      </div>
    </div>

    <div
      class="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-3"
      :style="{ paddingBottom: 'max(12px, var(--zt-safe-bottom, 0px))' }"
    >
      <p class="text-center text-[12px] font-bold text-slate-400 dark:text-slate-500">
        Bu chatga qo'shilib yozib bo'lmaydi
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChatMessage } from '~/types'
import { chatMediaUrlKey } from '~/composables/useVoiceMedia'
import { hidePhoneNumbers } from '~/utils/phone'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const orderId = computed(() => String(route.query.orderId || ''))
const driverUserId = computed(() => String(route.query.driverUserId || ''))

const loading = ref(true)
const error = ref('')
const messages = ref<IChatMessage[]>([])
const orderText = ref('')
const driverName = ref('Haydovchi')
const customerName = ref("Yo'lovchi")
const driverAvatar = ref('')
const customerAvatar = ref('')
const driverId = ref('')
const customerId = ref('')

/** Interest chat media — maxsus endpoint (boshqa haydovchi chatiga ruxsat) */
const interestMediaUrl = (messageId: string) => {
  let apiBase = String(runtimeConfig.public.baseUrl || '')
  if (/localhost|127\.0\.0\.1/i.test(apiBase)) {
    apiBase = 'https://api.zortaksi.uz/api/v1'
  }
  apiBase = apiBase.replace(/\/$/, '')
  const oid = encodeURIComponent(orderId.value)
  const did = encodeURIComponent(driverUserId.value)
  const mid = encodeURIComponent(messageId)
  return `${apiBase}/orders/${oid}/interest/${did}/messages/${mid}/media`
}
provide(chatMediaUrlKey, interestMediaUrl)

/** Driver chatida out = haydovchi, in = yo'lovchi */
const isDriverMsg = (msg: IChatMessage) => msg.direction === 'out'

const msgId = (msg: IChatMessage) => String((msg as any)?._id || (msg as any)?.id || '')

const isMediaMsg = (msg: IChatMessage) => {
  const t = String(msg.type || '')
  if (t === 'voice' || t === 'photo' || t === 'sticker' || t === 'document' || t === 'location') return true
  // type yo'q, lekin media path bor
  const path = String(msg.mediaPath || '')
  if (path && path !== 'remote' && t !== 'text') return true
  if (path === 'remote') return true
  if (msg.locationLat != null && msg.locationLng != null) return true
  return false
}

const mediaTypeOf = (msg: IChatMessage): IChatMessage['type'] => {
  const t = String(msg.type || '')
  if (t === 'voice' || t === 'photo' || t === 'sticker' || t === 'location') {
    return t as IChatMessage['type']
  }
  if (msg.locationLat != null && msg.locationLng != null) return 'location'
  if (msg.duration) return 'voice'
  if (t === 'document') {
    const mime = String(msg.mimeType || '')
    if (mime.startsWith('image/') || String(msg.mediaPath || '').startsWith('photo/')) {
      return 'photo'
    }
    return 'document'
  }
  if (msg.mediaPath && t !== 'text') {
    const mime = String(msg.mimeType || '')
    if (mime.startsWith('image/') || String(msg.mediaPath || '').startsWith('photo/')) {
      return 'photo'
    }
    return 'document'
  }
  return (t || 'text') as IChatMessage['type']
}

const speakerOf = (msg: IChatMessage) => {
  if (isDriverMsg(msg)) {
    return {
      name: driverName.value,
      avatar: driverAvatar.value,
      userId: driverId.value,
    }
  }
  return {
    name: customerName.value,
    avatar: customerAvatar.value,
    userId: customerId.value,
  }
}

const formatTime = (value: string | Date) => {
  if (!value) return ''
  const d = new Date(value)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const goBack = () => {
  if (import.meta.client && window.history.length > 1) router.back()
  else navigateTo('/driver/orders')
}

const load = async () => {
  loading.value = true
  error.value = ''
  messages.value = []
  if (!orderId.value || !driverUserId.value) {
    error.value = 'Order yoki haydovchi topilmadi'
    loading.value = false
    return
  }
  try {
    const res = await useApi(
      `/orders/${encodeURIComponent(orderId.value)}/interest/${encodeURIComponent(driverUserId.value)}/chat`,
    )
    if (!res?.success || !res.data) {
      error.value = res?.message || 'Chat yuklanmadi'
      return
    }
    const data = res.data
    messages.value = ((data.messages || []) as IChatMessage[]).map((m) => ({
      ...m,
      _id: String((m as any)._id || (m as any).id || ''),
    }))
    orderText.value = hidePhoneNumbers(
      String(data.orderText || data.chat?.orderText || ''),
    )
    driverName.value = data.driver?.name || 'Haydovchi'
    customerName.value = data.customer?.name || "Yo'lovchi"
    driverAvatar.value = data.driver?.avatar || ''
    customerAvatar.value = data.customer?.avatar || data.chat?.peer?.avatar || ''
    driverId.value = data.driver?.userId || driverUserId.value
    customerId.value = data.customer?.userId || data.chat?.peer?.userId || ''
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      'Chat yuklanmadi'
    error.value = String(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

watch([orderId, driverUserId], () => {
  void load()
})
</script>
