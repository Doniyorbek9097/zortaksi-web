<template>
  <div
    class="fixed inset-0 z-40 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
    :style="{ paddingTop: 'var(--zt-safe-top, 0px)' }"
  >
    <header
      class="shrink-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
    >
      <div class="mx-auto w-full max-w-2xl px-3 py-1.5 flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 active:scale-95 transition-all"
          aria-label="Orqaga"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <ProfileAvatar :name="headerName" :src="headerAvatar" :user-id="headerUserId" size="sm" />

        <div class="flex-1 min-w-0 leading-none">
          <p class="text-[13px] font-black truncate text-slate-900 dark:text-white">
            {{ headerName }}
          </p>
          <p class="text-[10px] font-medium truncate mt-0.5 text-amber-600 dark:text-amber-400">
            Faqat ko'rish · yozib bo'lmaydi
          </p>
        </div>
      </div>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div class="mx-auto w-full max-w-2xl px-3 py-4 space-y-2 min-h-full flex flex-col">
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

        <div
          class="rounded-xl px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
        >
          {{ driverName }} ↔ {{ customerName }}
        </div>

        <div v-if="loading" class="space-y-2">
          <div
            v-for="n in 6"
            :key="n"
            class="h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            :class="n % 2 ? 'w-1/2' : 'w-2/3 ml-auto'"
          />
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

        <ChatMessageBubble
          v-for="msg in messages"
          :key="msg._id"
          :text="msg.text"
          :time="formatTime(msg.date)"
          :date="msg.date"
          :out="msg.direction === 'out'"
          :read="msg.status === 'read'"
          :status="msg.status"
          :type="msg.type"
          :message-id="msg._id"
          :media-path="msg.mediaPath"
          :duration="msg.duration"
          :location-lat="msg.locationLat"
          :location-lng="msg.locationLng"
          :location-title="msg.locationTitle"
        />
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

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()

const orderId = computed(() => String(route.query.orderId || ''))
const driverUserId = computed(() => String(route.query.driverUserId || ''))

const loading = ref(true)
const error = ref('')
const messages = ref<IChatMessage[]>([])
const orderText = ref('')
const driverName = ref('Haydovchi')
const customerName = ref('Buyurtmachi')
const driverAvatar = ref('')
const driverId = ref('')

const headerName = computed(() => driverName.value)
const headerAvatar = computed(() => driverAvatar.value)
const headerUserId = computed(() => driverId.value)

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
    if (!res.success || !res.data) {
      error.value = res.message || 'Chat yuklanmadi'
      return
    }
    const data = res.data
    messages.value = (data.messages || []) as IChatMessage[]
    orderText.value = String(data.orderText || data.chat?.orderText || '')
    driverName.value = data.driver?.name || 'Haydovchi'
    customerName.value = data.customer?.name || 'Buyurtmachi'
    driverAvatar.value = data.driver?.avatar || ''
    driverId.value = data.driver?.userId || driverUserId.value
  } catch (e: any) {
    error.value = e?.message || 'Chat yuklanmadi'
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
