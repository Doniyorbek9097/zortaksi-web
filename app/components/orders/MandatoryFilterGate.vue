<template>
  <OrdersFilterPanel
    v-if="showGate"
    mandatory
    v-model="draftKeywords"
    v-model:bot-group-id="draftBotGroupId"
    @save="onSave"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { usePostStore } from '~/stores/post.store'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  saveOrderFilterKeywords,
  saveOrderFilterBotGroupId,
  clearOrderFilterKeywords,
  clearOrderFilterBotGroupId,
  markOrderFilterConfigured,
  isOrderFilterConfigured,
  ORDERS_PAGE_LIMIT,
} from '~/utils/orderFilterKeywords'
import { ORDERS_SCOPE_STORAGE_KEY, type OrdersScope } from '~/utils/ordersScope'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const postStore = usePostStore()

const draftKeywords = ref('')
const draftBotGroupId = ref<string | null>(null)

const showGate = computed(() => {
  if (!import.meta.client || !authStore.sessionReady) return false
  if (authStore.user?.role === 'admin') return false
  return !isOrderFilterConfigured()
})

const readScope = (): OrdersScope => {
  try {
    const s = sessionStorage.getItem(ORDERS_SCOPE_STORAGE_KEY)
    if (s === 'mine' || s === 'others' || s === 'all') return s
  } catch { /* ignore */ }
  return 'all'
}

const onSave = async () => {
  const kw = draftKeywords.value.trim()
  const gid = kw ? String(draftBotGroupId.value || '').trim() : ''

  if (kw) saveOrderFilterKeywords(kw)
  else clearOrderFilterKeywords()

  if (gid) saveOrderFilterBotGroupId(gid)
  else clearOrderFilterBotGroupId()

  markOrderFilterConfigured()

  const scope = readScope()
  orderStore.applyListFilter({
    page: 1,
    limit: ORDERS_PAGE_LIMIT,
    scope,
    ...(gid ? { botGroupId: gid } : { search: kw || undefined }),
  })

  orderStore.orders = []
  void orderStore.fetchOrders({
    page: 1,
    limit: ORDERS_PAGE_LIMIT,
    scope,
    ...(gid ? { botGroupId: gid } : { search: kw || undefined }),
  })
  void orderStore.refreshScopeCounts(gid ? undefined : kw || undefined, gid || undefined)
  void postStore.setSearch(kw, gid)
}

watch(
  showGate,
  (v) => {
    if (!v) return
    draftKeywords.value = loadOrderFilterKeywords()
    draftBotGroupId.value = loadOrderFilterBotGroupId() || null
  },
  { immediate: true },
)
</script>
