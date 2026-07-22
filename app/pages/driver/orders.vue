<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-5 pb-28 space-y-4">
    <!-- Header -->
    <OrdersHeader :count="orderStore.total" :active="showFilter" @toggle="showFilter = !showFilter" />

    <!-- Filter panel -->
    <OrdersFilterPanel v-if="showFilter" v-model:keyword="keyword" v-model:text="text" />

    <!-- Loading (birinchi yuklash) -->
    <div v-if="orderStore.isLoading && !orderStore.orders.length" class="space-y-4 pt-2">
      <div v-for="n in 3" :key="n" class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!orderStore.orders.length"
      class="py-16 text-center text-slate-400 dark:text-slate-500"
    >
      <font-awesome-icon icon="fa-solid fa-clipboard-list" class="text-3xl mb-3 opacity-50" />
      <p class="text-sm font-bold">Buyurtma topilmadi</p>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-6 pt-2">
      <OrdersOrderCard
        v-for="order in orderStore.orders"
        :key="order._id"
        :order="order"
        :role="role"
        :active="active"
        @unlock="onUnlock"
        @book="onBook(order)"
        @message="onMessage(order)"
        @view-group="onViewGroup(order)"
        @agent="onAgent(order)"
        @stop-group="onStopGroup(order)"
        @stop-user="onStopUser(order)"
        @delete="onDelete(order)"
      />

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-1" />

      <!-- Yuklanmoqda (keyingi sahifa) -->
      <div v-if="orderStore.isLoadingMore" class="space-y-4">
        <div v-for="n in 2" :key="n" class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>

      <!-- Oxiri -->
      <p
        v-else-if="!orderStore.hasMore && orderStore.orders.length"
        class="py-4 text-center text-[12px] font-medium text-slate-400 dark:text-slate-600"
      >
        Barcha buyurtmalar ko'rsatildi
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IOrder } from '~/types'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'

definePageMeta({
  layout: 'driver',
})

const authStore = useAuthStore()
const orderStore = useOrderStore()
const chatStore = useChatStore()

// Rol va aktivlik — tugmalarni ko'rsatishni boshqaradi
const role = computed(() => authStore.user?.role)
const active = computed(() => !!authStore.user?.active)

// --- Filtr holati ---
const showFilter = ref(false)
const keyword = ref('')
const text = ref('')

const LIMIT = 10

const queryParams = () => ({
  limit: LIMIT,
  search: keyword.value.trim() || undefined,
  text: text.value.trim() || undefined,
})

// Birinchi sahifa (ro'yxatni almashtiradi)
const load = () => orderStore.fetchOrders({ page: 1, ...queryParams() })

// Keyingi sahifa (ro'yxatga qo'shadi)
const loadMore = () => orderStore.loadMore(queryParams())

// Filtrlar o'zgarsa — debounce bilan qayta yuklash (1-sahifadan)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([keyword, text], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 400)
})

// "LIVE" tuyg'usi uchun yengil polling — faqat 1-sahifada (pagination'ni buzmasligi uchun)
let pollTimer: ReturnType<typeof setInterval> | null = null

// --- Infinite scroll (IntersectionObserver) ---
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  load()
  pollTimer = setInterval(() => {
    // Foydalanuvchi keyingi sahifalarni yuklagan bo'lsa — avtomatik reset qilmaymiz
    if (orderStore.page === 1) load()
  }, 15000)

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

// Sentinel v-if bilan paydo bo'lsa/yo'qolsa — qayta kuzatamiz
watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (pollTimer) clearInterval(pollTimer)
  if (observer) observer.disconnect()
})

const onUnlock = () => navigateTo('/driver/tariffs')

// --- Karta amallari ---
const openLink = (url: string) => {
  if (import.meta.client) window.open(url, '_blank')
}

const onBook = (_order: IOrder) => {
  // TODO: band qilish (backend endpoint) — buyurtmani band qilish
}

const onMessage = async (order: IOrder) => {
  if (!order._id) return
  try {
    const res = await chatStore.startChatFromOrder(order._id)
    if (res?.success && res.data?._id) {
      return navigateTo(`/driver/chat/${res.data._id}`)
    }
  } catch (err) {
    console.error('startChatFromOrder error:', err)
  }
  // Fallback — Telegram profiliga o'tish
  const username = order.sender?.username
  if (username) openLink(`https://t.me/${username}`)
}

const onViewGroup = (order: IOrder) => {
  const username = order.group?.username
  const msgId = order.message?.messageId
  if (username) openLink(`https://t.me/${username}${msgId ? '/' + msgId : ''}`)
}

const onAgent = (_order: IOrder) => {
  // TODO: admin — agentga biriktirish
}

const onStopGroup = (_order: IOrder) => {
  // TODO: admin — guruhni to'xtatish (kuzatuvdan olib tashlash)
}

const onStopUser = (_order: IOrder) => {
  // TODO: admin — foydalanuvchini to'xtatish/bloklash
}

const onDelete = (order: IOrder) => {
  // TODO: backend delete endpoint. Hozircha ro'yxatdan lokal olib tashlaymiz.
  orderStore.orders = orderStore.orders.filter((o) => o._id !== order._id)
}
</script>
