<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <!-- Header -->
    <OrdersHeader :count="orderStore.total" :active="showFilter" @toggle="showFilter = !showFilter" />

    <!-- Filter panel -->
    <OrdersFilterPanel v-if="showFilter" v-model:keyword="keyword" v-model:text="text" />

    <!-- Loading (birinchi yuklash) -->
    <div v-if="orderStore.isLoading && !orderStore.orders.length" class="space-y-4 pt-2">
      <div v-for="n in 3" :key="n" class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <!-- Empty -->
    <BaseEmptyState
      v-else-if="!orderStore.orders.length"
      icon="fa-solid fa-clipboard-list"
      title="Buyurtma topilmadi"
    />

    <!-- Orders list -->
    <div v-else class="space-y-6 pt-2">
      <TransitionGroup name="order-drop" tag="div" class="space-y-6">
        <OrdersOrderCard
          v-for="order in orderStore.orders"
          :key="order._id"
          :order="order"
          :role="role"
          :active="active"
          :current-user-id="authStore.user?.userId"
          @unlock="onUnlock"
          @book="onBook(order)"
          @unbook="onUnbook(order)"
          @message="onMessage(order)"
          @booked-chat="onBookedChat(order)"
          @agent="onAgent(order)"
          @stop-group="onStopGroup(order)"
          @stop-user="onStopUser(order)"
          @delete="onDelete(order)"
        />
      </TransitionGroup>

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

    <!-- Band qilish tasdiqlash -->
    <BaseConfirmDialog
      v-model="showBookDialog"
      title="Band qilish"
      :description="isAdmin ? 'Admin uchun bepul' : 'Hisobdan pul yechiladi'"
      :message="bookConfirmMessage"
      confirm-text="Band qilish"
      cancel-text="Bekor"
      variant="success"
      :loading="booking"
      :close-on-confirm="false"
      @confirm="confirmBook"
      @cancel="bookTarget = null"
    />

    <!-- Band bekor qilish (pul qaytarilmaydi) -->
    <BaseConfirmDialog
      v-model="showUnbookDialog"
      title="Band bekor qilish"
      description="Yechilgan pul qaytarilmaydi"
      message="Bandni bekor qilasizmi? Buyurtma yana ochiladi, lekin hisobdan olingan pul qaytmaydi."
      confirm-text="Bekor qilish"
      cancel-text="Yo'q"
      variant="warning"
      :loading="unbooking"
      :close-on-confirm="false"
      @confirm="confirmUnbook"
      @cancel="unbookTarget = null"
    />

    <!-- Pul yo'q / xato -->
    <BaseConfirmDialog
      v-model="showNoMoneyDialog"
      :title="noMoneyIsBalance ? 'Pul yo\'q' : 'Xatolik'"
      :description="noMoneyIsBalance ? 'Balans yetarli emas' : undefined"
      :message="noMoneyMessage"
      :confirm-text="noMoneyIsBalance ? 'Hisob to\'ldirish' : 'OK'"
      :cancel-text="noMoneyIsBalance ? 'Yopish' : 'Yopish'"
      variant="warning"
      @confirm="onNoMoneyConfirm"
    />

    <!-- Guruhni bloklash -->
    <BaseConfirmDialog
      v-model="showBlockGroupDialog"
      title="Guruhni bloklash"
      description="Bu guruhdan boshqa buyurtma olinmaydi"
      :message="blockGroupTarget
        ? `«${blockGroupTarget.group?.title || 'Guruh'}» bloklansinmi?`
        : ''"
      confirm-text="Bloklash"
      cancel-text="Bekor"
      variant="danger"
      :loading="blocking"
      :close-on-confirm="false"
      @confirm="confirmBlockGroup"
      @cancel="blockGroupTarget = null"
    />

    <!-- Senderni bloklash -->
    <BaseConfirmDialog
      v-model="showBlockUserDialog"
      title="Foydalanuvchini bloklash"
      description="Bu userdan boshqa buyurtma olinmaydi"
      :message="blockUserTarget
        ? `«${senderLabel(blockUserTarget)}» bloklansinmi?`
        : ''"
      confirm-text="Bloklash"
      cancel-text="Bekor"
      variant="danger"
      :loading="blocking"
      :close-on-confirm="false"
      @confirm="confirmBlockUser"
      @cancel="blockUserTarget = null"
    />

    <!-- Amal xatosi -->
    <BaseConfirmDialog
      v-model="showActionError"
      title="Xatolik"
      :message="actionError"
      confirm-text="OK"
      cancel-text="Yopish"
      variant="warning"
      @confirm="showActionError = false"
    />
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

const onUnlock = () => navigateTo('/driver/payment')

// --- Karta amallari ---
const openLink = (url: string) => {
  if (import.meta.client) window.open(url, '_blank')
}

const BOOK_PRICE = 1000
const isAdmin = computed(() => role.value === 'admin')
const showBookDialog = ref(false)
const showUnbookDialog = ref(false)
const showNoMoneyDialog = ref(false)
const booking = ref(false)
const unbooking = ref(false)
const bookTarget = ref<IOrder | null>(null)
const unbookTarget = ref<IOrder | null>(null)
const noMoneyMessage = ref('')
const noMoneyIsBalance = ref(true)

const bookConfirmMessage = computed(() => {
  if (isAdmin.value) {
    return "Bu buyurtmani band qilasizmi? Admin uchun bepul."
  }
  return `Bu buyurtmani band qilasizmi? Hisobingizdan ${BOOK_PRICE.toLocaleString('ru-RU')} so'm yechiladi.`
})

const onBook = (order: IOrder) => {
  if (!order._id || order.status === 'booked') return
  bookTarget.value = order
  showBookDialog.value = true
}

const onUnbook = (order: IOrder) => {
  if (!order._id || order.status !== 'booked') return
  unbookTarget.value = order
  showUnbookDialog.value = true
}

const confirmBook = async () => {
  const order = bookTarget.value
  if (!order?._id || booking.value) return
  booking.value = true
  try {
    await orderStore.bookOrder(order._id)
    showBookDialog.value = false
    bookTarget.value = null
    try { await authStore.getMe() } catch { /* ignore */ }
  } catch (e: any) {
    const status = e?.response?.status
    const data = e?.response?.data
    showBookDialog.value = false
    if (status === 402 || data?.data?.shortage != null) {
      const price = Number(data?.data?.price || BOOK_PRICE)
      const balance = Number(data?.data?.balance ?? authStore.user?.balance ?? 0)
      const shortage = Number(data?.data?.shortage || Math.max(0, price - balance))
      noMoneyIsBalance.value = true
      noMoneyMessage.value =
        data?.message ||
        `Pul yo'q. Balansingiz: ${balance.toLocaleString('ru-RU')} so'm. Yetishmaydi: ${shortage.toLocaleString('ru-RU')} so'm.`
      showNoMoneyDialog.value = true
      return
    }
    noMoneyIsBalance.value = false
    noMoneyMessage.value = data?.message || e?.message || 'Band qilish amalga oshmadi'
    showNoMoneyDialog.value = true
  } finally {
    booking.value = false
  }
}

const confirmUnbook = async () => {
  const order = unbookTarget.value
  if (!order?._id || unbooking.value) return
  unbooking.value = true
  try {
    await orderStore.unbookOrder(order._id)
    showUnbookDialog.value = false
    unbookTarget.value = null
  } catch (e: any) {
    showUnbookDialog.value = false
    noMoneyIsBalance.value = false
    noMoneyMessage.value =
      e?.response?.data?.message || e?.message || 'Bandni bekor qilib bo\'lmadi'
    showNoMoneyDialog.value = true
  } finally {
    unbooking.value = false
  }
}

const goPayment = () => {
  showNoMoneyDialog.value = false
  navigateTo('/driver/payment')
}

const onNoMoneyConfirm = () => {
  if (noMoneyIsBalance.value) goPayment()
  else showNoMoneyDialog.value = false
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

const onBookedChat = async (order: IOrder) => {
  if (!order._id) return
  try {
    const res = await chatStore.startChatWithBookedDriver(order._id)
    if (res?.success && res.data?._id) {
      const phone = res.data?.peer?.phone
      return navigateTo({
        path: `/driver/chat/${res.data._id}`,
        query: phone ? { phone: String(phone) } : undefined,
      })
    }
    showError(res?.message || 'Haydovchi bilan chat ochilmadi')
  } catch (err: any) {
    console.error('startChatWithBookedDriver error:', err)
    showError(err?.response?.data?.message || 'Haydovchi bilan chat ochilmadi')
  }
}

const senderLabel = (order: IOrder) => {
  const s = order.sender
  const full = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()
  return full || s?.username || s?.userId || 'Foydalanuvchi'
}

const onAgent = async (order: IOrder) => {
  // Agent — order egasi (owner) bilan chat
  if (!order._id) return
  try {
    const res = await chatStore.startChatWithOrderOwner(order._id)
    if (res?.success && res.data?._id) {
      return navigateTo(`/driver/chat/${res.data._id}`)
    }
    showError(res?.message || 'Agent chat ochilmadi')
  } catch (err: any) {
    console.error('startChatWithOrderOwner error:', err)
    showError(err?.response?.data?.message || 'Agent chat ochilmadi')
  }
  // Fallback — owner Telegram profili
  const username = order.owner?.username
  if (username) openLink(`https://t.me/${username}`)
}

const showBlockGroupDialog = ref(false)
const showBlockUserDialog = ref(false)
const blockGroupTarget = ref<IOrder | null>(null)
const blockUserTarget = ref<IOrder | null>(null)
const blocking = ref(false)
const actionError = ref('')
const showActionError = ref(false)

const showError = (msg: string) => {
  actionError.value = msg
  showActionError.value = true
}

const onStopGroup = (order: IOrder) => {
  if (!order._id) return
  blockGroupTarget.value = order
  showBlockGroupDialog.value = true
}

const onStopUser = (order: IOrder) => {
  if (!order._id) return
  blockUserTarget.value = order
  showBlockUserDialog.value = true
}

const confirmBlockGroup = async () => {
  const order = blockGroupTarget.value
  if (!order?._id || blocking.value) return
  blocking.value = true
  try {
    await orderStore.blockGroup(order._id)
    showBlockGroupDialog.value = false
    blockGroupTarget.value = null
  } catch (err: any) {
    showBlockGroupDialog.value = false
    showError(err?.response?.data?.message || 'Guruhni bloklash amalga oshmadi')
  } finally {
    blocking.value = false
  }
}

const confirmBlockUser = async () => {
  const order = blockUserTarget.value
  if (!order?._id || blocking.value) return
  blocking.value = true
  try {
    await orderStore.blockSender(order._id)
    showBlockUserDialog.value = false
    blockUserTarget.value = null
  } catch (err: any) {
    showBlockUserDialog.value = false
    showError(err?.response?.data?.message || 'Foydalanuvchini bloklash amalga oshmadi')
  } finally {
    blocking.value = false
  }
}

const onDelete = async (order: IOrder) => {
  if (!order._id) return
  try {
    await orderStore.deleteOrder(order._id)
  } catch (err: any) {
    showError(err?.response?.data?.message || "Buyurtmani o'chirib bo'lmadi")
  }
}
</script>

<style scoped>
.order-drop-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.order-drop-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  pointer-events: none;
}
.order-drop-enter-from {
  opacity: 0;
  transform: translateY(-28px) scale(0.98);
}
.order-drop-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
.order-drop-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
